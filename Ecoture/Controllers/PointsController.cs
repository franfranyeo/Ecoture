using Ecoture.Model.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ecoture.Controllers
{
    [Route("[controller]")]
    [ApiController]

    public class PointsController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;

        [HttpGet("history")]
        public async Task<IActionResult> GetAllPoints()
        {
            try
            {
                // Get user id from claims
                var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                var pointHistory = await _context.PointsTransactions
                    .Where(pt => pt.UserId == userId)
                    .Include(pt => pt.Reward)
                    .Include(pt => pt.Referral)
                    .OrderByDescending(pt => pt.CreatedAt)
                    .ToListAsync();

                return Ok(pointHistory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while fetching points history.");
            }
        }

        [HttpPost("claim-points")]
        public async Task<IActionResult> ClaimPoints()
        {
            try
            {
                // Get user id from claims
                var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }
                // Check if user can claim
                if (user.LastClaimTime.HasValue)
                {
                    var lastClaim = user.LastClaimTime.Value;
                    var now = DateTime.UtcNow;

                    // If last claim was today, return error
                    if (lastClaim.Date == now.Date)
                    {
                        return BadRequest(new { message = "Already claimed today" });
                    }
                }
                user.LastClaimTime = DateTime.UtcNow;
                user.TotalPoints += 5;

                var transaction = new PointsTransaction
                {
                    UserId = userId,
                    PointsEarned = 5,
                    TransactionType = "Daily Check-in",
                    CreatedAt = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddYears(1)
                };
                await _context.PointsTransactions.AddAsync(transaction);
                await _context.SaveChangesAsync();
                return Ok("Reward claimed successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while claiming reward.");
            }
        }

        [HttpGet("expiring")]
        public async Task<IActionResult> GetExpiringPoints()
        {
            try
            {
                // Get user id from claims
                var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // Calculate one month from now
                var oneMonthFromNow = DateTime.UtcNow.AddMonths(1).Date;

                // Get future expiring transactions within the next month
                var nearestExpiringTransaction = await _context.PointsTransactions
                    .Where(pt => pt.UserId == userId &&
                           pt.ExpiryDate.Date > DateTime.UtcNow.Date &&
                           pt.ExpiryDate.Date <= oneMonthFromNow)
                    .OrderBy(pt => pt.ExpiryDate) // Order by closest expiry date
                    .FirstOrDefaultAsync();

                if (nearestExpiringTransaction == null)
                {
                    return Ok(new { points = 0, expiryDate = (DateTime?)null });
                }

                // Return points and expiry date
                return Ok(new
                {
                    points = nearestExpiringTransaction.PointsEarned - nearestExpiringTransaction.PointsSpent,
                    expiryDate = nearestExpiringTransaction.ExpiryDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while fetching expiring points.");
            }
        }
    }
}
