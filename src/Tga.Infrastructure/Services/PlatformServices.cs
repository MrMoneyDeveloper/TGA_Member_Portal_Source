using Microsoft.EntityFrameworkCore;
using Tga.Application;
using Tga.Domain;
using Tga.Infrastructure.Persistence;
using System.Text.Json;
namespace Tga.Infrastructure.Services;

public static class Queries {
 public static async Task<MemberProfile> OwnMember(this TgaDbContext db,ICurrentUserService user,CancellationToken ct) => await db.Members.SingleOrDefaultAsync(x=>x.UserId==user.UserId,ct) ?? throw new RuleException("Member profile not found.",404);
 public static IQueryable<ProfileDto> Profiles(this IQueryable<MemberProfile> q)=>q.Select(x=>new ProfileDto(x.Id,x.MembershipNumber,x.FirstName,x.LastName,x.Email,x.MobileNumber,x.Province,x.Address,x.City,x.PostalCode));
 public static IQueryable<DocumentDto> DocumentDtos(this IQueryable<MemberDocument> q)=>q.Select(x=>new DocumentDto(x.Id,x.MemberId,x.Member.FirstName+" "+x.Member.LastName,x.OriginalFileName,x.Type.Name,x.UploadedUtc,x.Status,x.SizeBytes,x.RejectionReason,x.ExpiryDate));
 public static IQueryable<PaymentDto> PaymentDtos(this IQueryable<PaymentTransaction> q)=>q.Select(x=>new PaymentDto(x.Id,x.Member.FirstName+" "+x.Member.LastName,x.MerchantReference,x.PaymentType,x.CreatedUtc,x.Amount,x.Currency,x.Status,x.FailureReason));
 public static IQueryable<ResultDto> ResultDtos(this IQueryable<AssessmentAttempt> q)=>q.Select(x=>new ResultDto(x.Id,x.Member.FirstName+" "+x.Member.LastName,x.Assessment.Title,x.Percentage,x.Passed,x.Status,x.SubmittedUtc));
 public static IQueryable<AssessmentDto> AssessmentDtos(this IQueryable<Assessment> q)=>q.Select(x=>new AssessmentDto(x.Id,x.Title,x.Description,x.Instructions,x.PassPercentage,x.MaxAttempts,x.TimeLimitMinutes,x.IsAccredited,x.Questions.Count(q=>q.IsActive)));
 public static MembershipDto Dto(Membership m,DateTime now)=>new(m.Id,m.Plan.Name,m.Plan.AnnualFee,MembershipRules.EffectiveStatus(m.Status,m.EndDate,now),m.StartDate,m.EndDate,m.RenewalStatus);
}
public class MembershipNumberGenerator(TimeProvider clock) : IMembershipNumberGenerator { public string Generate()=>$"TGA-{clock.GetUtcNow().Year}-{Guid.NewGuid():N}"; }
public class AuditService(TgaDbContext db,ICurrentUserService user,TimeProvider clock) : IAuditService {
 public void Record(string action,string entityType,Guid entityId,string? previous=null,string? next=null)=>db.Add(new AuditEvent { TimestampUtc=clock.GetUtcNow().UtcDateTime,ActorUserId=string.IsNullOrEmpty(user.UserId)?null:user.UserId,ActorRole=user.Role,Action=action,EntityType=entityType,EntityId=entityId.ToString(),CorrelationId=user.CorrelationId,PreviousStateJson=previous,NewStateJson=next });
}
public class ConsoleEmailService(TgaDbContext db) : IEmailService { public Task RecordAsync(string userId,string template,CancellationToken ct) { db.Add(new NotificationLog{RecipientUserId=userId,TemplateKey=template,Channel="Email"}); return Task.CompletedTask; } }
public class ConsoleSmsService(TgaDbContext db) : ISmsService { public Task RecordAsync(string userId,string template,CancellationToken ct) { db.Add(new NotificationLog{RecipientUserId=userId,TemplateKey=template,Channel="Sms"}); return Task.CompletedTask; } }
public class NotificationService(TgaDbContext db,IEmailService email,TimeProvider clock) : INotificationService {
 public void Enqueue(string userId,string template)=>db.Add(new OutboxMessage{UserId=userId,TemplateKey=template});
 public async Task DispatchAsync(CancellationToken ct) { foreach(var message in await db.Set<OutboxMessage>().Where(x=>x.ProcessedUtc==null).OrderBy(x=>x.CreatedUtc).Take(100).ToListAsync(ct)) { await email.RecordAsync(message.UserId,message.TemplateKey,ct); message.ProcessedUtc=clock.GetUtcNow().UtcDateTime; message.Attempts++; } await db.SaveChangesAsync(ct); }
}
public class MembershipService(TgaDbContext db,ICurrentUserService user,IAuditService audit,INotificationService notifications,TimeProvider clock) : IMembershipService {
 public async Task<MembershipDto> GetOwnAsync(CancellationToken ct) { var member=await db.OwnMember(user,ct); var m=await db.Memberships.AsNoTracking().Include(x=>x.Plan).SingleAsync(x=>x.MemberId==member.Id,ct); return Queries.Dto(m,clock.GetUtcNow().UtcDateTime); }
 public async Task ChangeAsync(Guid id,MembershipStatus status,string reason,CancellationToken ct) {
  await using var tx=await db.Database.BeginTransactionAsync(ct); var m=await db.Memberships.Include(x=>x.Plan).Include(x=>x.Member).SingleOrDefaultAsync(x=>x.Id==id,ct)??throw new RuleException("Membership not found.",404);
  MembershipRules.ValidateTransition(m.Status,status,reason); var now=clock.GetUtcNow().UtcDateTime; var previous=m.Status;
  if(status==MembershipStatus.Active && m.StartDate==null) { m.StartDate=now;m.EndDate=MembershipRules.AnnualEnd(now,m.Plan.DurationMonths); }
  m.Status=status;m.UpdatedUtc=now;
  var application=await db.Applications.SingleOrDefaultAsync(x=>x.MemberId==m.MemberId&&x.Status=="Pending",ct);
  if(application!=null && status is MembershipStatus.Active or MembershipStatus.Rejected) { application.Status=status==MembershipStatus.Active?"Approved":"Rejected";application.ReviewedUtc=now;application.ReviewedByUserId=user.UserId;application.RejectionReason=status==MembershipStatus.Rejected?reason:null; }
  db.Add(new MembershipStatusHistory{MembershipId=id,PreviousStatus=previous,NewStatus=status,Reason=reason,ChangedBy=user.UserId,ChangedUtc=now});audit.Record("Membership"+status,nameof(Membership),id,JsonSerializer.Serialize(previous.ToString()),JsonSerializer.Serialize(status.ToString()));notifications.Enqueue(m.Member.UserId,status==MembershipStatus.Active?"membership-approved":"membership-rejected");await db.SaveChangesAsync(ct);await tx.CommitAsync(ct);await notifications.DispatchAsync(ct);
 }
 public async Task ExpireAsync(CancellationToken ct) { var now=clock.GetUtcNow().UtcDateTime; foreach(var m in await db.Memberships.Include(x=>x.Member).Where(x=>(x.Status==MembershipStatus.Active||x.Status==MembershipStatus.Expiring)&&x.EndDate<=now).ToListAsync(ct)) { db.Add(new MembershipStatusHistory{MembershipId=m.Id,PreviousStatus=m.Status,NewStatus=MembershipStatus.Expired,ChangedBy="system",Reason="Annual term ended",ChangedUtc=now});m.Status=MembershipStatus.Expired;m.UpdatedUtc=now;audit.Record("MembershipExpired",nameof(Membership),m.Id);notifications.Enqueue(m.Member.UserId,"membership-expired"); } await db.SaveChangesAsync(ct); }
}
public class AssessmentService(TgaDbContext db,ICurrentUserService user,IAuditService audit,INotificationService notifications,TimeProvider clock) : IAssessmentService {
 static ScoringQuestion[] Snapshot(AssessmentAttempt a)=>JsonSerializer.Deserialize<ScoringQuestion[]>(a.QuestionSnapshotJson)!;
 static AttemptDto Dto(AssessmentAttempt a)=>new(a.Id,a.AssessmentId,a.StartedUtc,a.TimeLimitMinutes,Snapshot(a).Select(q=>new QuestionDto(q.Id,q.Text,q.Type,q.Points,q.OptionIds.Select(id=>new OptionDto(id,q.Options[id])).ToArray())).ToArray());
 public async Task<AttemptDto> StartAsync(Guid assessmentId,CancellationToken ct) {
  await using var tx=await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable,ct); var member=await db.OwnMember(user,ct); var assessment=await db.Assessments.Include(x=>x.Questions).ThenInclude(x=>x.Options).SingleOrDefaultAsync(x=>x.Id==assessmentId&&x.IsActive,ct)??throw new RuleException("Assessment not found.",404);
  var existing=await db.Attempts.SingleOrDefaultAsync(x=>x.MemberId==member.Id&&x.AssessmentId==assessmentId&&x.Status==AttemptStatus.InProgress,ct); if(existing!=null) return Dto(existing);
  AssessmentRules.ValidateAttempt(await db.Attempts.CountAsync(x=>x.MemberId==member.Id&&x.AssessmentId==assessmentId,ct),assessment.MaxAttempts);
  var questions=assessment.Questions.Where(q=>q.IsActive).OrderBy(q=>q.SortOrder).Select(q=>new ScoringQuestion(q.Id,q.Points,q.QuestionType,q.Options.Where(o=>o.IsCorrect).Select(o=>o.Id).ToArray(),q.Options.OrderBy(o=>o.SortOrder).Select(o=>o.Id).ToArray(),q.QuestionText,q.Options.ToDictionary(o=>o.Id,o=>o.Text))).ToArray();if(questions.Length==0)throw new RuleException("Assessment has no questions.");
  if(assessment.RandomizeQuestions) System.Security.Cryptography.RandomNumberGenerator.Shuffle(questions.AsSpan());
  var attempt=new AssessmentAttempt{AssessmentId=assessmentId,MemberId=member.Id,StartedUtc=clock.GetUtcNow().UtcDateTime,PassPercentage=assessment.PassPercentage,TimeLimitMinutes=assessment.TimeLimitMinutes,QuestionSnapshotJson=JsonSerializer.Serialize(questions)};db.Add(attempt);await db.SaveChangesAsync(ct);await tx.CommitAsync(ct);return Dto(attempt);
 }
 async Task<AssessmentAttempt> Own(Guid id,CancellationToken ct) { var m=await db.OwnMember(user,ct);return await db.Attempts.Include(x=>x.Answers).Include(x=>x.Member).Include(x=>x.Assessment).SingleOrDefaultAsync(x=>x.Id==id&&x.MemberId==m.Id,ct)??throw new RuleException("Attempt not found.",404); }
 void Check(AssessmentAttempt a) { if(a.Status!=AttemptStatus.InProgress)throw new RuleException("Attempt already submitted.",409);if(a.TimeLimitMinutes.HasValue&&clock.GetUtcNow().UtcDateTime>a.StartedUtc.AddMinutes(a.TimeLimitMinutes.Value))throw new RuleException("Attempt time limit exceeded.",409); }
 public async Task SaveAnswersAsync(Guid attemptId,AnswerRequest request,CancellationToken ct) { var a=await Own(attemptId,ct);Check(a);if(request.Answers==null)throw new RuleException("Answers required.");AssessmentRules.Score(Snapshot(a),request.Answers,a.PassPercentage);foreach(var (id,values) in request.Answers) { var answer=a.Answers.SingleOrDefault(x=>x.QuestionId==id);if(answer==null){answer=new AssessmentAnswer{AttemptId=a.Id,QuestionId=id};a.Answers.Add(answer);db.Add(answer);}answer.SelectedAnswer=JsonSerializer.Serialize(values); } a.Version=Guid.NewGuid();await db.SaveChangesAsync(ct); }
 public async Task<ResultDto> SubmitAsync(Guid attemptId,CancellationToken ct) {
  await using var tx=await db.Database.BeginTransactionAsync(ct);var a=await Own(attemptId,ct);Check(a);var questions=Snapshot(a);var answers=a.Answers.ToDictionary(x=>x.QuestionId,x=>JsonSerializer.Deserialize<Guid[]>(x.SelectedAnswer)!);if(questions.Any(q=>!answers.TryGetValue(q.Id,out var selected)||selected.Length==0))throw new RuleException("Answer every question before submitting.");var result=AssessmentRules.Score(questions,answers,a.PassPercentage);
  a.Score=result.Score;a.Percentage=result.Percentage;a.Passed=result.Passed;a.Status=result.Passed?AttemptStatus.Passed:AttemptStatus.Failed;a.SubmittedUtc=clock.GetUtcNow().UtcDateTime;
  foreach(var answer in a.Answers) { var q=questions.Single(q=>q.Id==answer.QuestionId);answer.AwardedPoints=answers[q.Id].Order().SequenceEqual(q.CorrectOptions.Order())?q.Points:0; }
  audit.Record("AssessmentSubmitted",nameof(AssessmentAttempt),a.Id);notifications.Enqueue(a.Member.UserId,"assessment-result");await db.SaveChangesAsync(ct);await tx.CommitAsync(ct);await notifications.DispatchAsync(ct);return new(a.Id,a.Member.FirstName+" "+a.Member.LastName,a.Assessment.Title,a.Percentage,a.Passed,a.Status,a.SubmittedUtc);
 }
}
public class MockPaymentGateway : IPaymentGateway { public string Name=>"Mock"; public Task<CheckoutResult> CreateAsync(PaymentTransaction p,CancellationToken ct)=>Task.FromResult(new CheckoutResult(p.Id,Name,null,null)); }
public class PaymentService(TgaDbContext db,ICurrentUserService user,IPaymentGateway gateway,IAuditService audit,INotificationService notifications,TimeProvider clock) : IPaymentService {
 public async Task<CheckoutResult> CheckoutAsync(CheckoutRequest request,CancellationToken ct) {
  if(request.PaymentType is not ("Renewal" or "AnnualMembership"))throw new RuleException("Unsupported payment type.");var member=await db.OwnMember(user,ct);var m=await db.Memberships.Include(x=>x.Plan).SingleAsync(x=>x.MemberId==member.Id,ct);
  if(m.Status is MembershipStatus.Cancelled or MembershipStatus.Rejected or MembershipStatus.Suspended)throw new RuleException("Membership cannot receive this payment.",409);
  var pending=await db.Payments.SingleOrDefaultAsync(x=>x.MemberId==member.Id&&x.Status==PaymentStatus.Pending&&x.PaymentType==request.PaymentType,ct);if(pending!=null)return await gateway.CreateAsync(pending,ct);
  var payment=new PaymentTransaction{MemberId=member.Id,MembershipId=m.Id,PaymentType=request.PaymentType,Provider=gateway.Name,Amount=m.Plan.AnnualFee+(m.StartDate==null?m.Plan.JoiningFee:0),Status=PaymentStatus.Pending};var result=await gateway.CreateAsync(payment,ct);db.Add(payment);audit.Record("PaymentCreated",nameof(PaymentTransaction),payment.Id);await db.SaveChangesAsync(ct);return result;
 }
 public async Task CompleteMockAsync(Guid id,bool success,CancellationToken ct) {
  if(gateway.Name!="Mock")throw new RuleException("Mock payments are disabled.",404);await using var tx=await db.Database.BeginTransactionAsync(ct);var member=await db.OwnMember(user,ct);var p=await db.Payments.SingleOrDefaultAsync(x=>x.Id==id&&x.MemberId==member.Id,ct)??throw new RuleException("Payment not found.",404);if(p.Status is PaymentStatus.Paid or PaymentStatus.Failed)return;if(p.Status!=PaymentStatus.Pending)throw new RuleException("Payment is not pending.",409);
  var now=clock.GetUtcNow().UtcDateTime;p.Status=success?PaymentStatus.Paid:PaymentStatus.Failed;p.PaidUtc=success?now:null;p.FailedUtc=success?null:now;p.FailureReason=success?null:"Sandbox simulated failure";p.ProviderReference="mock-"+p.Id.ToString("N");
  db.Add(new PaymentWebhookEvent{Provider="Mock",ProviderEventId=p.ProviderReference,PayloadHash=Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(p.Id+":"+success))),ReceivedUtc=now,ProcessedUtc=now,ProcessingStatus="Processed"});
  if(success&&p.MembershipId.HasValue) { var m=await db.Memberships.Include(x=>x.Plan).SingleAsync(x=>x.Id==p.MembershipId,ct);if(m.Status is MembershipStatus.Cancelled or MembershipStatus.Rejected or MembershipStatus.Suspended)throw new RuleException("Membership no longer accepts payment.",409);m.LastPaymentId=p.Id;if(m.Status!=MembershipStatus.Pending) {var previous=m.Status;m.StartDate??=now;m.EndDate=MembershipRules.RenewalEnd(m.EndDate,now,m.Plan.DurationMonths);m.Status=MembershipStatus.Active;m.RenewalStatus="Renewed";db.Add(new MembershipStatusHistory{MembershipId=m.Id,PreviousStatus=previous,NewStatus=m.Status,ChangedBy=user.UserId,Reason="Mock annual payment",ChangedUtc=now});} }
  audit.Record(success?"PaymentReceived":"PaymentFailed",nameof(PaymentTransaction),p.Id);notifications.Enqueue(member.UserId,success?"payment-successful":"payment-failed");await db.SaveChangesAsync(ct);await tx.CommitAsync(ct);await notifications.DispatchAsync(ct);
 }
}
