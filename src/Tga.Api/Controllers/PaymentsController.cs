using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Tga.Application;
namespace Tga.Api.Controllers;
[ApiController,Authorize,Route("api/payments"),EnableRateLimiting("payment")]
public class PaymentsController(IPaymentService service) : ControllerBase {
 [HttpPost("checkout")] public async Task<IActionResult> Checkout(CheckoutRequest r,CancellationToken ct)=>Ok(await service.CheckoutAsync(r,ct));
 [HttpPost("{id:guid}/mock-complete")] public async Task<IActionResult> Complete(Guid id,MockCompleteRequest r,CancellationToken ct){await service.CompleteMockAsync(id,r.Success,ct);return NoContent();}
 [AllowAnonymous,HttpPost("payfast/itn")]public IActionResult PayFast()=>Problem(statusCode:503,title:"PayFast is disabled. No notification is accepted or processed in Mock mode.");
}
