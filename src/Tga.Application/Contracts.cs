using System.ComponentModel.DataAnnotations;
using Tga.Domain;
namespace Tga.Application;

public record RegisterRequest([Required,EmailAddress] string Email,[Required,MinLength(7)] string Password,[Required,StringLength(100)] string FirstName,[Required,StringLength(100)] string LastName,Guid PlanId,Guid[] PolicyIds);
public record LoginRequest([Required,EmailAddress] string Email,[Required] string Password);
public record EmailRequest([Required,EmailAddress] string Email);
public record ResetPasswordRequest([Required,EmailAddress] string Email,[Required] string Token,[Required,MinLength(12)] string Password);
public record VerifyEmailRequest([Required] string UserId,[Required] string Token);
public record ProfileRequest([Required,StringLength(100)] string FirstName,[Required,StringLength(100)] string LastName,[StringLength(30)] string MobileNumber,[StringLength(100)] string Province,[StringLength(500)] string Address,[StringLength(100)] string City="",[StringLength(20)] string PostalCode="");
public record ReviewRequest([Required,StringLength(1000)] string Reason);
public record StatusRequest(MembershipStatus Status,[Required,StringLength(1000)] string Reason);
public record AnswerRequest(Dictionary<Guid,Guid[]> Answers);
public record CheckoutRequest([Required] string PaymentType="Renewal");
public record MockCompleteRequest(bool Success);
public record AssessmentRequest([Required,StringLength(200)] string Title,[Required,StringLength(2000)] string Description,[Range(1,100)] decimal PassPercentage=80,[Range(1,100)] int? MaxAttempts=3,[Range(1,180)] int? TimeLimitMinutes=null,bool RandomizeQuestions=false,bool IsActive=true);
public record OptionRequest([Required,StringLength(1000)] string Text,bool IsCorrect);
public record QuestionRequest([Required,StringLength(2000)] string Text,QuestionType Type,[Range(1,100)] int Points,[MinLength(2),MaxLength(10)] OptionRequest[] Options);
public record PageResult<T>(IReadOnlyList<T> Items,int Total,int Page,int PageSize);
public record ProfileDto(Guid Id,string MembershipNumber,string FirstName,string LastName,string Email,string MobileNumber,string Province,string Address,string City,string PostalCode);
public record PlanDto(Guid Id,string Name,string Description,decimal JoiningFee,decimal AnnualFee,int DurationMonths);
public record MembershipDto(Guid Id,string Plan,decimal AnnualFee,MembershipStatus Status,DateTime? StartDate,DateTime? EndDate,string RenewalStatus);
public record MemberDto(Guid MemberId,Guid MembershipId,string Id,string Name,string Email,string Province,string Plan,string Status,DateTime? EndDate,int Documents,string Assessment);
public record DocumentDto(Guid Id,Guid MemberId,string MemberName,string Name,string Type,DateTime Date,DocumentStatus Status,long Size,string? RejectionReason,DateTime? ExpiryDate);
public record PaymentDto(Guid Id,string MemberName,string Reference,string PaymentType,DateTime Date,decimal Amount,string Currency,PaymentStatus Status,string? FailureReason);
public record OptionDto(Guid Id,string Text);
public record QuestionDto(Guid Id,string Text,QuestionType Type,int Points,OptionDto[] Options);
public record AssessmentDto(Guid Id,string Title,string Description,string Instructions,decimal PassPercentage,int? MaxAttempts,int? TimeLimitMinutes,bool IsAccredited,int QuestionCount);
public record AttemptDto(Guid Id,Guid AssessmentId,DateTime StartedUtc,int? TimeLimitMinutes,QuestionDto[] Questions);
public record ResultDto(Guid Id,string MemberName,string AssessmentTitle,decimal Percentage,bool Passed,AttemptStatus Status,DateTime? SubmittedUtc);
public record NotificationDto(Guid Id,string Channel,string TemplateKey,string Status,string Provider,DateTime CreatedUtc);
public record AuditDto(Guid Id,DateTime TimestampUtc,string? ActorUserId,string Action,string EntityType,string EntityId,string CorrelationId);
public record DashboardDto(int TotalMembers,int ActiveMembers,int PendingApplications,int ExpiringMemberships,int ExpiredMemberships,int PendingDocuments,int RejectedDocuments,int AssessmentAttempts,decimal PassRate,int SuccessfulPayments,int FailedPayments,decimal MembershipIncome,decimal RefundTotal);
public record StoredDocumentResult(string Key,string Checksum,long Size);
public record CheckoutResult(Guid PaymentId,string Provider,string? Url,Dictionary<string,string>? Fields);
public interface ICurrentUserService { string UserId { get; } string Role { get; } string CorrelationId { get; } }
public interface IMembershipNumberGenerator { string Generate(); }
public interface IDocumentStorageService { Task<StoredDocumentResult> UploadAsync(Stream stream,CancellationToken ct); Task<Stream> DownloadAsync(string key,CancellationToken ct); Task DeleteAsync(string key,CancellationToken ct); Task<bool> ExistsAsync(string key,CancellationToken ct); }
public interface IFileSecurityScanner { Task<bool> IsCleanAsync(Stream stream,CancellationToken ct); }
public interface IPaymentGateway { string Name { get; } Task<CheckoutResult> CreateAsync(PaymentTransaction payment,CancellationToken ct); }
public interface IEmailService { Task RecordAsync(string userId,string template,CancellationToken ct); }
public interface ISmsService { Task RecordAsync(string userId,string template,CancellationToken ct); }
public interface INotificationService { void Enqueue(string userId,string template); Task DispatchAsync(CancellationToken ct); }
public interface IAuditService { void Record(string action,string entityType,Guid entityId,string? previous=null,string? next=null); }
public interface IMembershipService { Task<MembershipDto> GetOwnAsync(CancellationToken ct); Task ChangeAsync(Guid id,MembershipStatus status,string reason,CancellationToken ct); Task ExpireAsync(CancellationToken ct); }
public interface IAssessmentService { Task<AttemptDto> StartAsync(Guid assessmentId,CancellationToken ct); Task SaveAnswersAsync(Guid attemptId,AnswerRequest request,CancellationToken ct); Task<ResultDto> SubmitAsync(Guid attemptId,CancellationToken ct); }
public interface IPaymentService { Task<CheckoutResult> CheckoutAsync(CheckoutRequest request,CancellationToken ct); Task CompleteMockAsync(Guid id,bool success,CancellationToken ct); }
