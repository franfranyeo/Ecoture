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
