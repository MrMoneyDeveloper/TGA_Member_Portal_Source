using Tga.Domain;
namespace Tga.UnitTests;
public class DomainRulesTests {
 [Fact]public void AnnualTermHandlesLeapYear()=>Assert.Equal(new DateTime(2025,2,28),MembershipRules.AnnualEnd(new DateTime(2024,2,29)));
 [Fact]public void EarlyRenewalPreservesRemainingTerm(){var now=new DateTime(2026,9,8);Assert.Equal(new DateTime(2027,10,8),MembershipRules.RenewalEnd(now.AddMonths(1),now));}
 [Fact]public void LateRenewalStartsNow(){var now=new DateTime(2026,9,8);Assert.Equal(now.AddYears(1),MembershipRules.RenewalEnd(now.AddDays(-2),now));}
 [Fact]public void ActiveExpiredTermTransitions()=>Assert.Equal(MembershipStatus.Expired,MembershipRules.EffectiveStatus(MembershipStatus.Active,DateTime.UtcNow.AddDays(-1),DateTime.UtcNow));
 [Fact]public void SuspendedTermIsNotSilentlyActivated()=>Assert.Equal(MembershipStatus.Suspended,MembershipRules.EffectiveStatus(MembershipStatus.Suspended,DateTime.UtcNow.AddDays(-1),DateTime.UtcNow));
 [Theory][InlineData(MembershipStatus.Active)][InlineData(MembershipStatus.Rejected)]public void PendingApplicationCanBeReviewed(MembershipStatus status)=>MembershipRules.ValidateTransition(MembershipStatus.Pending,status,"Demo review");
 [Fact]public void ApprovalRequiresReason()=>Assert.Throws<RuleException>(()=>MembershipRules.ValidateTransition(MembershipStatus.Pending,MembershipStatus.Active,""));
 [Fact]public void RejectedApplicationCannotBeActivatedDirectly()=>Assert.Throws<RuleException>(()=>MembershipRules.ValidateTransition(MembershipStatus.Rejected,MembershipStatus.Active,"No"));
 [Theory][InlineData("sample.pdf","application/pdf","%PDF-1.4")][InlineData("sample.exe","application/pdf","bad")][InlineData("sample.pdf","image/png","bad")]
 public void FileExtensionMimeAndSignatureMustMatch(string name,string mime,string signature){var action=()=>DocumentRules.Validate(name,mime,10,new DocumentType(),System.Text.Encoding.ASCII.GetBytes(signature));if(name=="sample.pdf"&&mime=="application/pdf")action();else Assert.Throws<RuleException>(action);}
 [Fact]public void OversizeFileRejected()=>Assert.Throws<RuleException>(()=>DocumentRules.Validate("sample.pdf","application/pdf",6000000,new DocumentType(),"%PDF-1.4"u8));
 [Theory][InlineData(true,DocumentStatus.Approved)][InlineData(false,DocumentStatus.Rejected)]public void DocumentReviewState(bool approved,DocumentStatus expected)=>Assert.Equal(expected,DocumentRules.Reviewed(approved,null,DateTime.UtcNow));
 [Fact]public void ExpiredDocumentCannotBeApproved()=>Assert.Equal(DocumentStatus.Expired,DocumentRules.Reviewed(true,DateTime.UtcNow.AddDays(-1),DateTime.UtcNow));
 [Fact]public void MultipleChoiceRequiresExactSet(){var a=Guid.NewGuid();var b=Guid.NewGuid();var q=new ScoringQuestion(Guid.NewGuid(),2,QuestionType.MultipleChoice,[a,b],[a,b],"demo",new(){{a,"one"},{b,"two"}});Assert.False(AssessmentRules.Score([q],new Dictionary<Guid,Guid[]>{{q.Id,[a]}},80).Passed);Assert.True(AssessmentRules.Score([q],new Dictionary<Guid,Guid[]>{{q.Id,[b,a]}},80).Passed);}
 [Fact]public void UnknownAnswerRejected(){var q=new ScoringQuestion(Guid.NewGuid(),1,QuestionType.SingleChoice,[],[],"demo",new());Assert.Throws<RuleException>(()=>AssessmentRules.Score([q],new Dictionary<Guid,Guid[]>{{q.Id,[Guid.NewGuid()]}},80));}
 [Fact]public void MaxAttemptsEnforced()=>Assert.Throws<RuleException>(()=>AssessmentRules.ValidateAttempt(3,3));
 [Theory][InlineData(Policies.Members)][InlineData(Policies.Documents)][InlineData(Policies.Payments)][InlineData(Policies.Assessments)]public void MemberHasNoStaffPolicy(string policy)=>Assert.DoesNotContain(Roles.Member,Policies.Grants[policy]);
 [Fact]public void FinanceCannotManageAssessments()=>Assert.DoesNotContain(Roles.Finance,Policies.Grants[Policies.Assessments]);
}
