using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Tga.Application;
using Tga.Domain;
using Tga.Infrastructure.Persistence;
namespace Tga.Api.Security;
public class CurrentUserService(IHttpContextAccessor accessor) : ICurrentUserService {
 public string UserId=>accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)??"";
 public string Role=>string.Join(',',accessor.HttpContext?.User.FindAll(ClaimTypes.Role).Select(x=>x.Value)??[]);
 public string CorrelationId=>accessor.HttpContext?.TraceIdentifier??"background";
}
public class AuthService(TgaDbContext db,UserManager<AppUser> users,IConfiguration config,IWebHostEnvironment env,TimeProvider clock) {
 public static string Hash(string token)=>Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
 public async Task<object> IssueAsync(AppUser user,HttpResponse response,Guid? family=null,CancellationToken ct=default) {
  var now=clock.GetUtcNow().UtcDateTime;var token=Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));var session=new RefreshSession{UserId=user.Id,TokenHash=Hash(token),ExpiresUtc=now.AddDays(7),FamilyId=family??Guid.NewGuid()};db.Add(session);await db.SaveChangesAsync(ct);var roles=await users.GetRolesAsync(user);
  var claims=new List<Claim>{new(ClaimTypes.NameIdentifier,user.Id),new("session",session.Id.ToString())};claims.AddRange(roles.Select(r=>new Claim(ClaimTypes.Role,r)));var jwt=new JwtSecurityToken("tga-api","tga-portal",claims,now,now.AddMinutes(10),new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!)),SecurityAlgorithms.HmacSha256));
  response.Cookies.Append("tga_refresh",token,Cookie());return new{accessToken=new JwtSecurityTokenHandler().WriteToken(jwt),expiresIn=600,user=new{id=user.Id,email=user.Email,roles}};
 }
 public CookieOptions Cookie()=>new(){HttpOnly=true,Secure=!env.IsDevelopment(),SameSite=env.IsDevelopment()?SameSiteMode.Lax:SameSiteMode.None,Path="/api/auth",MaxAge=TimeSpan.FromDays(7)};
 public void ValidateOrigin(HttpRequest request) {var allowed=config.GetSection("AllowedOrigins").Get<string[]>()??["http://localhost:5173","http://127.0.0.1:5173"];if(!allowed.Contains(request.Headers.Origin.ToString(),StringComparer.OrdinalIgnoreCase))throw new RuleException("Untrusted request origin.",403);}
}
