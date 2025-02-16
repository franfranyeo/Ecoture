using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using Ecoture.Model.DTO;
using Ecoture.Model.Entity;

namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RefundController : ControllerBase
    {
        private readonly MyDbContext _context;

        public RefundController(MyDbContext context)
        {
            _context = context;
        }

        // ✅ Submit a Refund Request
        [HttpPost, Authorize]
        public IActionResult RequestRefund([FromBody] RefundRequestDTO requestDto)
        {
            // ✅ Debug: Log the incoming request data
            Console.WriteLine($"Received refund request: OrderItemId={requestDto.OrderItemId}, Reason={requestDto.Reason}");

            // ✅ Validate Input
            if (requestDto.OrderItemId <= 0 || string.IsNullOrEmpty(requestDto.Reason))
            {
                Console.WriteLine("❌ Invalid refund request data.");
                return BadRequest(new { message = "Invalid refund request data." });
            }

            int userId = GetUserId();
            Console.WriteLine($"User ID from token: {userId}");

            // ✅ Fetch the order item (with order details)
            var orderItem = _context.OrderItems
                .Include(o => o.Order)
                .FirstOrDefault(o => o.Id == requestDto.OrderItemId && o.Order.UserId == userId);

            if (orderItem == null)
            {
                Console.WriteLine($"❌ OrderItemId {requestDto.OrderItemId} not found or not owned by user.");
                return NotFound(new { message = "Order item not found or not owned by user." });
            }

            // ✅ Create refund request
            var refundRequest = new RefundRequest
            {
                OrderItemId = requestDto.OrderItemId,
                UserId = userId,
                Reason = requestDto.Reason,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            // ✅ Save to database
            _context.RefundRequests.Add(refundRequest);
            _context.SaveChanges();

            Console.WriteLine("✅ Refund request submitted successfully.");
            return Ok(new { message = "Refund request submitted successfully!" });
        }

        // ✅ Get a Single Refund Request by ID
        [HttpGet("{id}")]
        public IActionResult GetRefundById(int id)
        {
            Console.WriteLine($"Fetching refund request for ID: {id}");

            var refund = _context.RefundRequests
                .Include(r => r.OrderItem)
                .Where(r => r.UserId == id)
                .Select(r => new RefundRequestDTO
                {
                    Id = r.Id,
                    OrderItemId = r.OrderItemId,
                    UserId = r.UserId,
                    Reason = r.Reason,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt
                });

            if (refund == null)
            {
                Console.WriteLine($"❌ Refund request with ID {id} not found.");
                return NotFound(new { message = "Refund request not found." });
            }

            return Ok(refund);
        }

        // ✅ Get All Refund Requests (Admin Only)
        [HttpGet("all")]
        public IActionResult GetAllRefundRequests()
        {
            Console.WriteLine("Fetching all refund requests..."); // ✅ Debugging log

            var refunds = _context.RefundRequests
                .Select(r => new
                {
                    Id = r.Id,
                    OrderItemId = r.OrderItemId,
                    UserId = r.UserId,
                    Reason = r.Reason,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt
                })
                .ToList();

            if (refunds == null || !refunds.Any())
            {
                Console.WriteLine("No refund requests found.");
                return NotFound(new { message = "No refund requests found." });
            }

            return Ok(refunds);
        }
        // ✅ Update Refund Request Status (Admin Only) (ADDED THIS AT 256)
        [HttpPut("{id}/status")]
        public IActionResult UpdateRefundStatus(int id, [FromBody] UpdateRefundStatusDTO request)
        {
            var refund = _context.RefundRequests.FirstOrDefault(r => r.Id == id);
            if (refund == null)
            {
                return NotFound(new { message = "Refund request not found." });
            }

            refund.Status = request.Status;
            _context.SaveChanges();

            return Ok(new { message = $"Refund request {request.Status} successfully." });
        }


        // ✅ Helper method to get authenticated user ID
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID claim not found.");
            }
            return int.Parse(userIdClaim);
        }
    }
}
