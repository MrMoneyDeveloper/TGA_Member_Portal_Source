using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Tga.Domain;
namespace Tga.Infrastructure.Persistence;

public class AppUser : IdentityUser { public bool IsActive { get; set; } = true; }
public class TgaDbContext(DbContextOptions options,TimeProvider clock) : IdentityDbContext<AppUser>(options) {
 public DbSet<MemberProfile> Members => Set<MemberProfile>(); public DbSet<Membership> Memberships => Set<Membership>(); public DbSet<MembershipPlan> Plans => Set<MembershipPlan>();
 public DbSet<MembershipApplication> Applications => Set<MembershipApplication>(); public DbSet<MemberDocument> Documents => Set<MemberDocument>(); public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
 public DbSet<Assessment> Assessments => Set<Assessment>(); public DbSet<AssessmentAttempt> Attempts => Set<AssessmentAttempt>(); public DbSet<PaymentTransaction> Payments => Set<PaymentTransaction>();
 protected override void OnModelCreating(ModelBuilder b) {
  base.OnModelCreating(b);
  foreach(var type in typeof(Entity).Assembly.GetTypes().Where(t=>t.IsClass&&!t.IsAbstract&&typeof(Entity).IsAssignableFrom(t))) b.Entity(type);
  foreach(var type in b.Model.GetEntityTypes().Where(t=>typeof(Entity).IsAssignableFrom(t.ClrType))) {
   b.Entity(type.ClrType).HasKey("Id");
   if(typeof(VersionedEntity).IsAssignableFrom(type.ClrType)) b.Entity(type.ClrType).Property("Version").IsConcurrencyToken();
   foreach(var p in type.GetProperties()) { if(p.ClrType==typeof(string)) p.SetMaxLength(p.Name.EndsWith("Json")?null:2000); if(p.ClrType==typeof(decimal)||p.ClrType==typeof(decimal?)) { p.SetPrecision(18);p.SetScale(2); } }
  }
  b.Entity<MemberProfile>().HasIndex(x=>x.UserId).IsUnique(); b.Entity<MemberProfile>().HasIndex(x=>x.MembershipNumber).IsUnique(); b.Entity<MemberProfile>().HasIndex(x=>x.Email); b.Entity<MemberProfile>().HasIndex(x=>x.MobileNumber);
  b.Entity<MemberProfile>().HasOne<AppUser>().WithOne().HasForeignKey<MemberProfile>(x=>x.UserId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<Membership>().HasOne(x=>x.Member).WithOne().HasForeignKey<Membership>(x=>x.MemberId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<Membership>().HasOne(x=>x.Plan).WithMany().HasForeignKey(x=>x.MembershipPlanId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<Membership>().HasIndex(x=>new{x.Status,x.EndDate});
  b.Entity<Membership>().HasOne<PaymentTransaction>().WithMany().HasForeignKey(x=>x.LastPaymentId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<MembershipApplication>().HasOne<MemberProfile>().WithMany().HasForeignKey(x=>x.MemberId).OnDelete(DeleteBehavior.Restrict); b.Entity<MembershipApplication>().HasOne<MembershipPlan>().WithMany().HasForeignKey(x=>x.MembershipPlanId).OnDelete(DeleteBehavior.Restrict); b.Entity<MembershipApplication>().HasIndex(x=>x.Status);
  b.Entity<MembershipStatusHistory>().HasOne<Membership>().WithMany().HasForeignKey(x=>x.MembershipId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<MemberDocument>().HasOne(x=>x.Member).WithMany().HasForeignKey(x=>x.MemberId).OnDelete(DeleteBehavior.Restrict); b.Entity<MemberDocument>().HasOne(x=>x.Type).WithMany().HasForeignKey(x=>x.DocumentTypeId).OnDelete(DeleteBehavior.Restrict); b.Entity<MemberDocument>().HasIndex(x=>new{x.Status,x.ExpiryDate}); b.Entity<MemberDocument>().HasQueryFilter(x=>!x.IsDeleted);
  b.Entity<DocumentReviewHistory>().HasOne<MemberDocument>().WithMany().HasForeignKey(x=>x.MemberDocumentId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<Assessment>().HasMany(x=>x.Questions).WithOne().HasForeignKey(x=>x.AssessmentId).OnDelete(DeleteBehavior.Restrict); b.Entity<Question>().HasMany(x=>x.Options).WithOne().HasForeignKey(x=>x.QuestionId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<AssessmentAttempt>().HasOne(x=>x.Assessment).WithMany().HasForeignKey(x=>x.AssessmentId).OnDelete(DeleteBehavior.Restrict); b.Entity<AssessmentAttempt>().HasOne(x=>x.Member).WithMany().HasForeignKey(x=>x.MemberId).OnDelete(DeleteBehavior.Restrict); b.Entity<AssessmentAttempt>().HasMany(x=>x.Answers).WithOne().HasForeignKey(x=>x.AttemptId).OnDelete(DeleteBehavior.Restrict); b.Entity<AssessmentAttempt>().HasIndex(x=>new{x.MemberId,x.AssessmentId,x.Status});
  b.Entity<AssessmentAnswer>().HasIndex(x=>new{x.AttemptId,x.QuestionId}).IsUnique(); b.Entity<AssessmentAnswer>().HasOne<Question>().WithMany().HasForeignKey(x=>x.QuestionId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<Certificate>().HasOne<AssessmentAttempt>().WithOne().HasForeignKey<Certificate>(x=>x.AssessmentAttemptId).OnDelete(DeleteBehavior.Restrict); b.Entity<Certificate>().HasOne<MemberProfile>().WithMany().HasForeignKey(x=>x.MemberId).OnDelete(DeleteBehavior.Restrict); b.Entity<Certificate>().HasIndex(x=>x.CertificateNumber).IsUnique();
  b.Entity<PaymentTransaction>().HasOne(x=>x.Member).WithMany().HasForeignKey(x=>x.MemberId).OnDelete(DeleteBehavior.Restrict); b.Entity<PaymentTransaction>().HasOne<Membership>().WithMany().HasForeignKey(x=>x.MembershipId).OnDelete(DeleteBehavior.Restrict); b.Entity<PaymentTransaction>().HasIndex(x=>x.MerchantReference).IsUnique(); b.Entity<PaymentTransaction>().HasIndex(x=>new{x.Provider,x.ProviderReference}).IsUnique().HasFilter("[ProviderReference] IS NOT NULL"); b.Entity<PaymentTransaction>().HasIndex(x=>x.Status);
  b.Entity<PaymentWebhookEvent>().HasIndex(x=>new{x.Provider,x.ProviderEventId}).IsUnique(); b.Entity<Refund>().HasOne<PaymentTransaction>().WithMany().HasForeignKey(x=>x.PaymentTransactionId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<AuditEvent>().HasIndex(x=>x.TimestampUtc); b.Entity<AuditEvent>().HasIndex(x=>x.EntityId); b.Entity<NotificationTemplate>().HasIndex(x=>x.TemplateKey).IsUnique();
  b.Entity<PolicyDocument>().HasIndex(x=>new{x.Type,x.Version}).IsUnique(); b.Entity<UserPolicyAcceptance>().HasOne<PolicyDocument>().WithMany().HasForeignKey(x=>x.PolicyDocumentId).OnDelete(DeleteBehavior.Restrict); b.Entity<UserPolicyAcceptance>().HasIndex(x=>new{x.UserId,x.PolicyDocumentId}).IsUnique();
  b.Entity<RefreshSession>().HasIndex(x=>x.TokenHash).IsUnique(); b.Entity<RefreshSession>().HasIndex(x=>x.FamilyId);
  foreach(var type in new[]{typeof(RefreshSession),typeof(OtpChallenge),typeof(UserPolicyAcceptance)}) b.Entity(type).HasOne(typeof(AppUser)).WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Restrict);
  b.Entity<NotificationLog>().HasOne<AppUser>().WithMany().HasForeignKey(x=>x.RecipientUserId).OnDelete(DeleteBehavior.Restrict); b.Entity<OutboxMessage>().HasOne<AppUser>().WithMany().HasForeignKey(x=>x.UserId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<SupportRequest>().HasOne<AppUser>().WithMany().HasForeignKey(x=>x.UserId).OnDelete(DeleteBehavior.Restrict);
  b.Entity<SupportRequest>().HasIndex(x=>x.Reference).IsUnique();
  // Keep indexed strings within SQL Server's key-size limits.
  foreach(var type in b.Model.GetEntityTypes().Where(t=>typeof(Entity).IsAssignableFrom(t.ClrType)))
   foreach(var property in type.GetProperties().Where(p=>p.ClrType==typeof(string)))
    if(property.GetContainingIndexes().Any()||property.GetContainingForeignKeys().Any())property.SetMaxLength(property.Name.EndsWith("UserId")?450:120);
 }
 public override Task<int> SaveChangesAsync(CancellationToken ct=default) {
  foreach(var e in ChangeTracker.Entries<Entity>()) { if(e.State==EntityState.Added) e.Entity.CreatedUtc=clock.GetUtcNow().UtcDateTime; if(e.State==EntityState.Modified&&e.Entity is VersionedEntity v) v.Version=Guid.NewGuid(); }
  return base.SaveChangesAsync(ct);
 }
}
public class DemoDbContext(DbContextOptions<DemoDbContext> options,TimeProvider clock) : TgaDbContext(options,clock);
public class SqlServerDbContext(DbContextOptions<SqlServerDbContext> options,TimeProvider clock) : TgaDbContext(options,clock);
