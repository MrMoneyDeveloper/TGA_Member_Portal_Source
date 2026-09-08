using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tga.Application;
using Tga.Domain;
using Tga.Infrastructure.Persistence;
namespace Tga.Api.Controllers;
public record SupportInput([Required,StringLength(1000)]string Message);
[ApiController,Authorize,Route("api")]
public class SandboxController(TgaDbContext db,ICurrentUserService user,IAuditService audit) : ControllerBase {
 [HttpPost("support")]public async Task<IActionResult> Support(SupportInput r,CancellationToken ct){var ticket=new SupportRequest{UserId=user.UserId,Message=r.Message,Reference="TGA-SUPPORT-"+Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()};db.Add(ticket);audit.Record("SupportRequestCreated",nameof(SupportRequest),ticket.Id);await db.SaveChangesAsync(ct);return Ok(new{id=ticket.Reference,message="Saved in the sandbox. No external message was sent."});}
 [HttpPost("payments/{id:guid}/cancel")]public async Task<IActionResult> Cancel(Guid id,CancellationToken ct){var p=await db.Payments.SingleOrDefaultAsync(x=>x.Id==id&&x.Member.UserId==user.UserId,ct)??throw new RuleException("Payment not found.",404);if(p.Status!=PaymentStatus.Pending)throw new RuleException("Payment is no longer pending.",409);p.Status=PaymentStatus.Cancelled;audit.Record("PaymentCancelled",nameof(PaymentTransaction),id);await db.SaveChangesAsync(ct);return NoContent();}
 // No destructive server reset endpoint: a fresh SQLite file seeds automatically.
 // Operators reset a deployed sandbox by replacing its ephemeral data directory.
}
