using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Tga.Application;
using Tga.Domain;
using Tga.Infrastructure.Persistence;
using Tga.Infrastructure.Services;
using Tga.Infrastructure.Storage;
using Tga.Api.Security;

var builder=WebApplication.CreateBuilder(args);
var config=builder.Configuration;
var demo=(config["TGA_DATA_MODE"]??"Demo")=="Demo";
if(builder.Environment.IsProduction()) throw new InvalidOperationException("Production requires reviewed storage, scanner, email/SMS and payment adapters; see docs/OPEN_BUSINESS_DECISIONS.md.");
if(!demo&&config["TGA_DATA_MODE"]!="SqlServer")throw new InvalidOperationException("Unknown TGA_DATA_MODE.");
var key=config["Jwt:Key"]??(builder.Environment.IsDevelopment()?Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(48)):throw new InvalidOperationException("Set Jwt__Key to at least 32 random characters."));
config["Jwt:Key"]=key;
if(Encoding.UTF8.GetByteCount(key)<32)throw new InvalidOperationException("Jwt__Key must contain at least 32 bytes.");
if(config["TGA_PAYMENT_MODE"] is not (null or "Mock"))throw new InvalidOperationException("Only Mock is enabled. PayFast requires merchant verification before activation.");
var origins=config.GetSection("AllowedOrigins").Get<string[]>()??["http://localhost:5173","http://127.0.0.1:5173"];
builder.Services.AddSingleton(TimeProvider.System);
if(demo){Directory.CreateDirectory("data");builder.Services.AddDbContext<DemoDbContext>(o=>o.UseSqlite(config.GetConnectionString("Demo")??"Data Source=data/tga.db"));builder.Services.AddScoped<TgaDbContext>(s=>s.GetRequiredService<DemoDbContext>());}
else{builder.Services.AddDbContext<SqlServerDbContext>(o=>o.UseSqlServer(config.GetConnectionString("SqlServer")??throw new InvalidOperationException("Set ConnectionStrings__SqlServer.")));builder.Services.AddScoped<TgaDbContext>(s=>s.GetRequiredService<SqlServerDbContext>());}
builder.Services.AddIdentityCore<AppUser>(o=>{o.Password.RequiredLength=demo?7:12;o.Password.RequireNonAlphanumeric=!demo;o.Password.RequireUppercase=!demo;o.Password.RequireDigit=true;o.User.RequireUniqueEmail=true;o.Lockout.MaxFailedAccessAttempts=5;o.Lockout.DefaultLockoutTimeSpan=TimeSpan.FromMinutes(15);}).AddRoles<IdentityRole>().AddEntityFrameworkStores<TgaDbContext>().AddSignInManager().AddDefaultTokenProviders();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o=>{o.TokenValidationParameters=new(){ValidateIssuer=true,ValidIssuer="tga-api",ValidateAudience=true,ValidAudience="tga-portal",ValidateLifetime=true,ValidateIssuerSigningKey=true,IssuerSigningKey=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!)),ClockSkew=TimeSpan.FromSeconds(10)};o.Events=new JwtBearerEvents{OnTokenValidated=async ctx=>{var db=ctx.HttpContext.RequestServices.GetRequiredService<TgaDbContext>();var id=ctx.Principal!.FindFirstValue(ClaimTypes.NameIdentifier);var sid=ctx.Principal!.FindFirstValue("session");var now=ctx.HttpContext.RequestServices.GetRequiredService<TimeProvider>().GetUtcNow().UtcDateTime;if(!await db.Users.AnyAsync(x=>x.Id==id&&x.IsActive)||!Guid.TryParse(sid,out var session)||!await db.Set<RefreshSession>().AnyAsync(x=>x.Id==session&&x.UserId==id&&x.RevokedUtc==null&&x.ExpiresUtc>now))ctx.Fail("Session revoked.");}};});
builder.Services.AddAuthorization(o=>{foreach(var (policy,roles) in Policies.Grants)o.AddPolicy(policy,p=>p.RequireRole(roles));});
builder.Services.AddCors(o=>o.AddDefaultPolicy(p=>p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithExposedHeaders("X-Correlation-ID")));
builder.Services.AddRateLimiter(o=>{o.RejectionStatusCode=429;foreach(var (name,limit) in new[]{("auth",30),("upload",20),("payment",40)})o.AddPolicy(name,ctx=>RateLimitPartition.GetFixedWindowLimiter(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)??ctx.Connection.RemoteIpAddress?.ToString()??"unknown",_=>new FixedWindowRateLimiterOptions{PermitLimit=limit,Window=TimeSpan.FromMinutes(1),QueueLimit=0}));});
builder.Services.Configure<ForwardedHeadersOptions>(o=>{o.ForwardedHeaders=ForwardedHeaders.XForwardedFor|ForwardedHeaders.XForwardedProto;foreach(var ip in config.GetSection("TrustedProxies").Get<string[]>()??[])o.KnownProxies.Add(System.Net.IPAddress.Parse(ip));});
builder.Services.AddHttpContextAccessor();builder.Services.AddScoped<ICurrentUserService,CurrentUserService>();builder.Services.AddScoped<AuthService>();builder.Services.AddScoped<IAuditService,AuditService>();builder.Services.AddScoped<IMembershipService,MembershipService>();builder.Services.AddScoped<IAssessmentService,AssessmentService>();builder.Services.AddScoped<IPaymentService,PaymentService>();builder.Services.AddScoped<IPaymentGateway,MockPaymentGateway>();builder.Services.AddScoped<INotificationService,NotificationService>();builder.Services.AddScoped<IEmailService,ConsoleEmailService>();builder.Services.AddScoped<ISmsService,ConsoleSmsService>();builder.Services.AddScoped<IMembershipNumberGenerator,MembershipNumberGenerator>();builder.Services.AddSingleton<IDocumentStorageService,DemoDocumentStorageService>();builder.Services.AddSingleton<IFileSecurityScanner,DemoFileSecurityScanner>();builder.Services.AddScoped<DemoDataSeeder>();
builder.Services.AddProblemDetails(o=>o.CustomizeProblemDetails=ctx=>ctx.ProblemDetails.Extensions["traceId"]=ctx.HttpContext.TraceIdentifier);
builder.Services.AddControllers().AddJsonOptions(o=>o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));builder.Services.AddEndpointsApiExplorer();builder.Services.AddSwaggerGen();builder.Services.AddResponseCompression();builder.Logging.AddJsonConsole();
var app=builder.Build();if(int.TryParse(config["PORT"],out var port))app.Urls.Add($"http://0.0.0.0:{port}");
app.UseForwardedHeaders();
app.Use(async(ctx,next)=>{ctx.TraceIdentifier=Guid.NewGuid().ToString("N");ctx.Response.Headers["X-Correlation-ID"]=ctx.TraceIdentifier;ctx.Response.Headers["X-Content-Type-Options"]="nosniff";ctx.Response.Headers["Referrer-Policy"]="no-referrer";ctx.Response.Headers["X-Frame-Options"]="DENY";ctx.Response.Headers.CacheControl="no-store";var timer=System.Diagnostics.Stopwatch.StartNew();try{await next();}finally{app.Logger.LogInformation("Request {Method} {Path} {Status} {ElapsedMs} {CorrelationId} {Environment}",ctx.Request.Method,ctx.Request.Path.Value,ctx.Response.StatusCode,timer.ElapsedMilliseconds,ctx.TraceIdentifier,app.Environment.EnvironmentName);}});
app.UseExceptionHandler(handler=>handler.Run(async ctx=>{var error=ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()!.Error;var status=error is RuleException r?r.Status:error is DbUpdateConcurrencyException?409:500;await Results.Problem(statusCode:status,title:error is RuleException?error.Message:status==409?"Record changed; reload and retry.":"Unexpected server error.",extensions:new Dictionary<string,object?>{{"traceId",ctx.TraceIdentifier}}).ExecuteAsync(ctx);}));
app.UseStatusCodePages(async ctx=>await Results.Problem(statusCode:ctx.HttpContext.Response.StatusCode,title:"Request could not be completed.").ExecuteAsync(ctx.HttpContext));
app.UseResponseCompression();app.UseCors();app.UseAuthentication();app.UseAuthorization();app.UseRateLimiter();app.UseSwagger();app.UseSwaggerUI();app.MapControllers();
app.MapGet("/health",()=>Results.Ok(new{status="healthy"}));app.MapGet("/health/ready",async(TgaDbContext db,CancellationToken ct)=>await db.Database.CanConnectAsync(ct)?Results.Ok(new{status="ready"}):Results.Problem(statusCode:503,title:"Database unavailable"));
if(demo){using var scope=app.Services.CreateScope();var db=scope.ServiceProvider.GetRequiredService<TgaDbContext>();await db.Database.MigrateAsync();await scope.ServiceProvider.GetRequiredService<DemoDataSeeder>().SeedAsync();}
app.Run();
public partial class Program { }
