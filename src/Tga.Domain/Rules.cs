namespace Tga.Domain;

public static class Roles {
 public const string Member = "Member", MembershipAdmin = "MembershipAdministrator", DocumentVerifier = "DocumentVerifier", Finance = "FinanceUser", Assessor = "Assessor", Support = "SupportAgent", SystemAdmin = "SystemAdministrator";
 public static readonly string[] All = [Member, MembershipAdmin, DocumentVerifier, Finance, Assessor, Support, SystemAdmin];
}
public static class Policies {
 public const string Members = "CanManageMembers", Documents = "CanVerifyDocuments", Payments = "CanManagePayments", Assessments = "CanManageAssessments", Audit = "CanViewAuditLog", System = "CanManageSystem", Support = "CanSupportMembers", Staff = "Staff";
 public static readonly Dictionary<string,string[]> Grants = new() { [Members] = [Roles.SystemAdmin,Roles.MembershipAdmin], [Documents] = [Roles.SystemAdmin,Roles.DocumentVerifier], [Payments] = [Roles.SystemAdmin,Roles.Finance], [Assessments] = [Roles.SystemAdmin,Roles.Assessor], [Audit] = [Roles.SystemAdmin], [System] = [Roles.SystemAdmin], [Support] = [Roles.SystemAdmin,Roles.Support,Roles.MembershipAdmin], [Staff] = Roles.All.Where(r => r != Roles.Member).ToArray() };
}
public class RuleException(string message, int status = 400) : Exception(message) { public int Status { get; } = status; }
public static class MembershipRules {
 public static DateTime AnnualEnd(DateTime start, int months = 12) => months is > 0 and <= 120 ? start.AddMonths(months) : throw new RuleException("Invalid membership duration.");
 public static DateTime RenewalEnd(DateTime? end, DateTime now, int months = 12) => AnnualEnd(end > now ? end.Value : now, months);
 public static MembershipStatus EffectiveStatus(MembershipStatus status, DateTime? end, DateTime now) => status is MembershipStatus.Active or MembershipStatus.Expiring && end <= now ? MembershipStatus.Expired : status is MembershipStatus.Active && end <= now.AddDays(30) ? MembershipStatus.Expiring : status;
 public static void ValidateTransition(MembershipStatus from, MembershipStatus to, string reason) {
  if (string.IsNullOrWhiteSpace(reason)) throw new RuleException("A reason is required.");
  var allowed = to switch { MembershipStatus.Active => from is MembershipStatus.Pending or MembershipStatus.Suspended, MembershipStatus.Rejected => from == MembershipStatus.Pending, MembershipStatus.Suspended => from is MembershipStatus.Active or MembershipStatus.Expiring, MembershipStatus.Cancelled => from is not MembershipStatus.Cancelled, _ => false };
  if (!allowed) throw new RuleException("This membership transition is not permitted.",409);
 }
}
public record ScoringQuestion(Guid Id, int Points, QuestionType Type, Guid[] CorrectOptions, Guid[] OptionIds, string Text, Dictionary<Guid,string> Options);
public static class AssessmentRules {
 public static (int Score, decimal Percentage, bool Passed) Score(IReadOnlyList<ScoringQuestion> questions, IReadOnlyDictionary<Guid,Guid[]> answers, decimal pass) {
  if (questions.Count == 0 || questions.Sum(q=>q.Points) <= 0) throw new RuleException("Assessment has no questions.");
  if (answers.Keys.Any(id=>questions.All(q=>q.Id!=id))) throw new RuleException("Unknown question.");
  var score=0;
  foreach(var q in questions) { var selected=answers.GetValueOrDefault(q.Id) ?? []; if(selected.Distinct().Count()!=selected.Length || selected.Any(id=>!q.OptionIds.Contains(id)) || (q.Type!=QuestionType.MultipleChoice && selected.Length>1)) throw new RuleException("Invalid answer options."); if(selected.Order().SequenceEqual(q.CorrectOptions.Order())) score+=q.Points; }
  var percentage=Math.Round(100m*score/questions.Sum(q=>q.Points),2); return (score,percentage,percentage>=pass);
 }
 public static void ValidateAttempt(int count, int? max) { if(max.HasValue && count>=max) throw new RuleException("Maximum attempts reached.",409); }
}
public static class DocumentRules {
 public static void Validate(string name,string mime,long size,DocumentType type,ReadOnlySpan<byte> header) {
  var ext=Path.GetExtension(name).ToLowerInvariant(); var expected=ext switch { ".pdf"=>"application/pdf", ".jpg" or ".jpeg"=>"image/jpeg", ".png"=>"image/png", _=>"" };
  if(expected=="" || mime!=expected || !type.AllowedMimeTypes.Split(',').Contains(mime)) throw new RuleException("Only the configured PDF, JPEG or PNG types are allowed.");
  if(size<=0 || size>type.MaxSizeBytes) throw new RuleException("File exceeds the permitted size or is empty.");
  var valid = mime switch { "application/pdf"=>header.StartsWith("%PDF-"u8), "image/png"=>header.StartsWith(new byte[]{137,80,78,71,13,10,26,10}), "image/jpeg"=>header.StartsWith(new byte[]{255,216,255}), _=>false };
  if(!valid) throw new RuleException("File content does not match its declared type.");
 }
 public static DocumentStatus Reviewed(bool approved,DateTime? expiry,DateTime now) => expiry<=now ? DocumentStatus.Expired : approved ? DocumentStatus.Approved : DocumentStatus.Rejected;
}
