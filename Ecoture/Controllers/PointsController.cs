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

        private string GetTransactionDescription(PointsTransaction transaction)
        {
            switch (transaction.TransactionType.ToLower())
            {
                case "referral":
                    return $"Earned {transaction.PointsEarned} points for referring a friend";
                case "order":
                    return $"Earned {transaction.PointsEarned} points for your purchase";
                case "review":
                    return $"Earned {transaction.PointsEarned} points for leaving a review";
                case "daily":
                    return $"Earned {transaction.PointsEarned} points for logging in today";
                case "welcome":
                    return $"Welcome Gift: {transaction.PointsEarned} points added to your account";
                case "redemption":
                    var rewardTitle = transaction.Reward?.RewardTitle ?? "reward";
                    return $"Used {transaction.PointsSpent} points for {rewardTitle}";
                default:
                    return transaction.PointsEarned > 0
                        ? $"Earned {transaction.PointsEarned} points"
                        : $"Used {transaction.PointsSpent} points";
            }
        }
    }
}
