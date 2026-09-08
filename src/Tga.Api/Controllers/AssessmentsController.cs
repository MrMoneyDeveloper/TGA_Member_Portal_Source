using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tga.Application;
using Tga.Domain;
using Tga.Infrastructure.Persistence;
using Tga.Infrastructure.Services;
namespace Tga.Api.Controllers;
[ApiController,Authorize,Route("api/assessments")]
public class AssessmentsController(TgaDbContext db,ICurrentUserService user,IAssessmentService service,IAuditService audit,TimeProvider clock) : ControllerBase {
 [HttpGet]public async Task<IActionResult> List(CancellationToken ct)=>Ok(await db.Assessments.AsNoTracking().Where(x=>x.IsActive).AssessmentDtos().ToListAsync(ct));
 [HttpGet("{id:guid}")]public async Task<IActionResult> Get(Guid id,CancellationToken ct)=>Ok(await db.Assessments.AsNoTracking().Where(x=>x.Id==id&&x.IsActive).AssessmentDtos().SingleOrDefaultAsync(ct)??throw new RuleException("Assessment not found.",404));
 [HttpPost("{id:guid}/attempts")]public async Task<IActionResult> Start(Guid id,CancellationToken ct)=>Ok(await service.StartAsync(id,ct));
 [HttpPut("/api/assessment-attempts/{id:guid}/answers")]public async Task<IActionResult> Answers(Guid id,AnswerRequest r,CancellationToken ct){await service.SaveAnswersAsync(id,r,ct);return NoContent();}
 [HttpPost("/api/assessment-attempts/{id:guid}/submit")]public async Task<IActionResult> Submit(Guid id,CancellationToken ct)=>Ok(await service.SubmitAsync(id,ct));
 [HttpGet("/api/assessment-attempts/{id:guid}/result")]public async Task<IActionResult> Result(Guid id,CancellationToken ct)=>Ok(await db.Attempts.AsNoTracking().Where(x=>x.Id==id&&x.Member.UserId==user.UserId&&x.Status!=AttemptStatus.InProgress).ResultDtos().SingleOrDefaultAsync(ct)??throw new RuleException("Result not found.",404));
 [Authorize(Policy=Policies.Assessments),HttpPost("/api/admin/assessments")]public async Task<IActionResult> Create(AssessmentRequest r,CancellationToken ct){var a=new Assessment();Apply(a,r);db.Add(a);audit.Record("AssessmentCreated",nameof(Assessment),a.Id);await db.SaveChangesAsync(ct);return Created("/api/assessments/"+a.Id,new{id=a.Id});}
 [Authorize(Policy=Policies.Assessments),HttpPatch("/api/admin/assessments/{id:guid}")]public async Task<IActionResult> Edit(Guid id,AssessmentRequest r,CancellationToken ct){var a=await db.Assessments.SingleOrDefaultAsync(x=>x.Id==id,ct)??throw new RuleException("Assessment not found.",404);Apply(a,r);audit.Record("AssessmentUpdated",nameof(Assessment),id);await db.SaveChangesAsync(ct);return NoContent();}
 void Apply(Assessment a,AssessmentRequest r){a.Title=r.Title;a.Description=r.Description;a.PassPercentage=r.PassPercentage;a.MaxAttempts=r.MaxAttempts;a.TimeLimitMinutes=r.TimeLimitMinutes;a.RandomizeQuestions=r.RandomizeQuestions;a.IsActive=r.IsActive;a.IsAccredited=false;a.UpdatedUtc=clock.GetUtcNow().UtcDateTime;}
 [Authorize(Policy=Policies.Assessments),HttpPost("/api/admin/assessments/{id:guid}/questions")]public async Task<IActionResult> Question(Guid id,QuestionRequest r,CancellationToken ct){if(!await db.Assessments.AnyAsync(x=>x.Id==id,ct))return NotFound();ValidateQuestion(r);var q=new Question{AssessmentId=id,QuestionText=r.Text,Points=r.Points,QuestionType=r.Type,SortOrder=await db.Set<Question>().CountAsync(x=>x.AssessmentId==id,ct),Options=r.Options.Select((o,i)=>new QuestionOption{Text=o.Text,IsCorrect=o.IsCorrect,SortOrder=i}).ToList()};db.Add(q);audit.Record("QuestionCreated",nameof(Question),q.Id);await db.SaveChangesAsync(ct);return Ok(new{id=q.Id});}
 static void ValidateQuestion(QuestionRequest r){var correct=r.Options.Count(x=>x.IsCorrect);if(correct==0||(r.Type!=QuestionType.MultipleChoice&&correct!=1)||(r.Type==QuestionType.TrueFalse&&r.Options.Length!=2)||r.Options.Any(x=>string.IsNullOrWhiteSpace(x.Text)))throw new RuleException("Invalid question options.");}
 [Authorize(Policy=Policies.Assessments),HttpPatch("/api/admin/questions/{id:guid}")]public async Task<IActionResult> EditQuestion(Guid id,QuestionRequest r,CancellationToken ct){ValidateQuestion(r);var q=await db.Set<Question>().Include(x=>x.Options).SingleOrDefaultAsync(x=>x.Id==id,ct)??throw new RuleException("Question not found.",404);q.QuestionText=r.Text;q.Points=r.Points;q.QuestionType=r.Type;db.RemoveRange(q.Options);q.Options=r.Options.Select((o,i)=>new QuestionOption{Text=o.Text,IsCorrect=o.IsCorrect,SortOrder=i}).ToList();db.AddRange(q.Options);audit.Record("QuestionUpdated",nameof(Question),id);await db.SaveChangesAsync(ct);return NoContent();}
}
