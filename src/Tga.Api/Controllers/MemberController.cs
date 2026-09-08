using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tga.Application;
using Tga.Domain;
using Tga.Infrastructure.Persistence;
using Tga.Infrastructure.Services;
namespace Tga.Api.Controllers;
[ApiController,Authorize,Route("api")]
public class MemberController(TgaDbContext db,ICurrentUserService user,IMembershipService memberships,IAuditService audit,TimeProvider clock) : ControllerBase {
 [AllowAnonymous,HttpGet("membership-plans")] public async Task<IActionResult> Plans(CancellationToken ct)=>Ok(await db.Plans.AsNoTracking().Where(x=>x.IsActive).Select(x=>new PlanDto(x.Id,x.Name,x.Description,x.JoiningFee,x.AnnualFee,x.DurationMonths)).ToListAsync(ct));
 [AllowAnonymous,HttpGet("policies")] public async Task<IActionResult> PoliciesList(CancellationToken ct)=>Ok(await db.Set<PolicyDocument>().AsNoTracking().Where(x=>x.IsActive).Select(x=>new{x.Id,x.Type,x.Version,x.Content}).ToListAsync(ct));
 [HttpGet("me/profile")] public async Task<IActionResult> Profile(CancellationToken ct)=>Ok(await db.Members.AsNoTracking().Where(x=>x.UserId==user.UserId).Profiles().SingleOrDefaultAsync(ct)??throw new RuleException("Profile not found.",404));
 [HttpPatch("me/profile")] public async Task<IActionResult> Profile(ProfileRequest r,CancellationToken ct){var m=await db.OwnMember(user,ct);m.FirstName=r.FirstName.Trim();m.LastName=r.LastName.Trim();m.MobileNumber=r.MobileNumber;m.Province=r.Province;m.Address=r.Address;m.City=r.City;m.PostalCode=r.PostalCode;m.UpdatedUtc=clock.GetUtcNow().UtcDateTime;audit.Record("ProfileUpdated",nameof(MemberProfile),m.Id);await db.SaveChangesAsync(ct);return NoContent();}
 [HttpGet("me/membership")] public async Task<IActionResult> Membership(CancellationToken ct)=>Ok(await memberships.GetOwnAsync(ct));
 [HttpGet("me/documents")] public async Task<IActionResult> Documents(CancellationToken ct)=>Ok(await db.Documents.AsNoTracking().Where(x=>x.Member.UserId==user.UserId).OrderByDescending(x=>x.UploadedUtc).Take(100).DocumentDtos().ToListAsync(ct));
 [HttpGet("me/payments")] public async Task<IActionResult> Payments(CancellationToken ct)=>Ok(await db.Payments.AsNoTracking().Where(x=>x.Member.UserId==user.UserId).OrderByDescending(x=>x.CreatedUtc).Take(100).PaymentDtos().ToListAsync(ct));
 [HttpGet("me/assessments")] public async Task<IActionResult> Results(CancellationToken ct)=>Ok(await db.Attempts.AsNoTracking().Where(x=>x.Member.UserId==user.UserId).OrderByDescending(x=>x.StartedUtc).Take(100).ResultDtos().ToListAsync(ct));
 [HttpGet("notifications")] public async Task<IActionResult> Notifications(CancellationToken ct)=>Ok(await db.Set<NotificationLog>().AsNoTracking().Where(x=>x.RecipientUserId==user.UserId).OrderByDescending(x=>x.CreatedUtc).Take(100).Select(x=>new NotificationDto(x.Id,x.Channel,x.TemplateKey,x.Status,x.Provider,x.CreatedUtc)).ToListAsync(ct));
 [HttpGet("me/membership-history")] public async Task<IActionResult> History(CancellationToken ct){var m=await db.OwnMember(user,ct);var membership=await db.Memberships.SingleAsync(x=>x.MemberId==m.Id,ct);return Ok(await db.Set<MembershipStatusHistory>().AsNoTracking().Where(x=>x.MembershipId==membership.Id).OrderByDescending(x=>x.ChangedUtc).Take(100).Select(x=>new{x.Id,MemberId=m.MembershipNumber,Previous=x.PreviousStatus,Status=x.NewStatus,x.Reason,CreatedUtc=x.ChangedUtc}).ToListAsync(ct));}
}
