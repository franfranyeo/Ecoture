using Microsoft.AspNetCore.Mvc;
using Ecoture.Model.Entity;
using Ecoture.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Ecoture.Model.Enum;

namespace Ecoture.Controllers
{
	[Route("[controller]")]
    [ApiController]
    public class RewardsController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;

        // GET: /Rewards
        [HttpGet, Authorize]
        public async Task<IActionResult> GetRewards()
        {
            if (User.IsInRole("Admin") || User.IsInRole("Staff"))
            {
                var rewards = await _context.Rewards.ToListAsync();
                return Ok(rewards);
            }
            else
            {
                var currentDate = DateTime.UtcNow;
                var availableRewards = await _context.Rewards
                    .Where(r => r.StartDate <= currentDate && r.ExpirationDate >= currentDate && r.Status == "Active")
                    .ToListAsync();
                return Ok(availableRewards);
            }
        }

        // GET: /Reward/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRewardById(int id)
        {
            var reward = await _context.Rewards.FindAsync(id);
            if (reward == null)
                return NotFound(new { message = "Reward not found" });

            return Ok(reward);
        }

        // POST: /Reward
        [HttpPost]
        [ProducesResponseType(typeof(RewardDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateReward([FromBody] RewardDTO rewardDto)
        {
            if (rewardDto == null)
                return BadRequest(new { message = "Invalid reward data" });

            var reward = new Reward
            {
                RewardType = rewardDto.RewardType,
                RewardTitle = rewardDto.RewardTitle,
                RewardDescription = rewardDto.RewardDescription,
                RewardCode = rewardDto.RewardCode,
                RewardPercentage = rewardDto.RewardPercentage,
                MinimumPurchaseAmount = rewardDto.MinimumPurchaseAmount,
                MaximumDiscountCap = rewardDto.MaximumDiscountCap,
                ExpirationDate = rewardDto.ExpirationDate,
                StartDate = rewardDto.StartDate,
                UsageLimit = rewardDto.UsageLimit,
                ApplicableProducts = rewardDto.ApplicableProducts,
                Exclusions = rewardDto.Exclusions,
                UserEligibility = rewardDto.UserEligibility,
                IsStackable = rewardDto.IsStackable,
                AutoApply = rewardDto.AutoApply,
                Status = rewardDto.Status,
                RewardImage = rewardDto.RewardImage,
                LoyaltyPointsRequired = rewardDto.LoyaltyPointsRequired,
                CreatedAt = DateTime.UtcNow, // Set creation timestamp
                UpdatedAt = DateTime.UtcNow, // Set update timestamp
                CreatedBy = rewardDto.CreatedBy
            };

            try
            {
                await _context.Rewards.AddAsync(reward);
                await _context.SaveChangesAsync();
                return Ok(rewardDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating reward", error = ex.Message });
            }
        }

        // PUT: /Reward/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReward(int id, [FromBody] RewardDTO rewardDto)
        {
            if (rewardDto == null)
                return BadRequest(new { message = "Invalid reward data" });

            var reward = await _context.Rewards.FindAsync(id);
            if (reward == null)
                return NotFound(new { message = "Reward not found" });

            // Update reward properties
            reward.RewardType = rewardDto.RewardType;
            reward.RewardTitle = rewardDto.RewardTitle;
            reward.RewardDescription = rewardDto.RewardDescription;
            reward.RewardCode = rewardDto.RewardCode;
            reward.RewardPercentage = rewardDto.RewardPercentage;
            reward.MinimumPurchaseAmount = rewardDto.MinimumPurchaseAmount;
            reward.MaximumDiscountCap = rewardDto.MaximumDiscountCap;
            reward.ExpirationDate = rewardDto.ExpirationDate;
            reward.StartDate = rewardDto.StartDate;
            reward.UsageLimit = rewardDto.UsageLimit;
            //reward.ApplicableProducts = rewardDto.ApplicableProducts;
            //reward.Exclusions = rewardDto.Exclusions;
            //reward.UserEligibility = rewardDto.UserEligibility;
            reward.IsStackable = rewardDto.IsStackable;
            reward.AutoApply = rewardDto.AutoApply;
            reward.Status = rewardDto.Status;
            reward.RewardImage = rewardDto.RewardImage;
            reward.LoyaltyPointsRequired = rewardDto.LoyaltyPointsRequired;
            reward.UpdatedAt = DateTime.UtcNow; // Update timestamp
            reward.CreatedBy = rewardDto.CreatedBy;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(reward);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating reward", error = ex.Message });
            }
        }

        // DELETE: /Reward/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReward(int id)
        {
            var reward = await _context.Rewards.FindAsync(id);
            if (reward == null)
                return NotFound(new { message = "Reward not found" });

            try
            {
                _context.Rewards.Remove(reward);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting reward", error = ex.Message });
            }
        }

        [HttpPost("Claim/{rewardId}")]
        [Authorize]
        public async Task<IActionResult> ClaimReward(int rewardId)
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Lock the reward record for update
                var reward = await _context.Rewards
                    .Include(r => r.UserRedemptions)
                    .FirstOrDefaultAsync(r => r.RewardId == rewardId);

                var user = await _context.Users
                    .Include(u => u.UserRedemptions)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                    return NotFound(new { message = "User not found" });
                if (reward == null)
                    return NotFound(new { message = "Reward not found" });

                // Validation checks
                if (reward.UsageLimit <= 0)
                    return BadRequest(new { message = "This reward has reached its usage limit" });
                if (user.UserRedemptions.Any(ur => ur.RewardId == rewardId))
                    return BadRequest(new { message = "You have already claimed this reward" });
                if (!IsUserEligibleForReward(user, reward))
                    return BadRequest(new { message = "You are not eligible for this reward" });

                // Check if user has enough points
                int pointsRequired = reward.LoyaltyPointsRequired ?? 0;
                if (user.TotalPoints < pointsRequired)
                    return BadRequest(new { message = "Insufficient points" });

                // Create redemption record
                var userRedemption = new UserRedemptions
                {
                    UserId = user.UserId,
                    RewardId = reward.RewardId,
                    RedemptionDate = DateTime.UtcNow
                };

                // Update reward status
                if (reward.UsageLimit == 1) 
                {
                    reward.Status = "Inactive";
                }
                reward.UsageLimit -= 1;

                // Update user points
                user.TotalPoints -= pointsRequired;

                // Record transaction
                var pointsTransaction = new PointsTransaction
                {
                    UserId = userId,
                    PointsSpent = pointsRequired,
                    TransactionType = "Reward Redemption",
                    CreatedAt = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddYears(1)
                };

                _context.PointsTransactions.Add(pointsTransaction);
                _context.UserRedemptions.Add(userRedemption);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Reward claimed successfully" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log the exception
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("UserRedemptions")]
        [Authorize]
        public async Task<IActionResult> GetUserRedemptions()
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            if (User.IsInRole("Admin") || User.IsInRole("Staff"))
            {
                var allRedemptions = await _context.UserRedemptions
                    .Include(ur => ur.User)
                    .Include(ur => ur.Reward)
                    .Select(ur => new UserRedemptionWithDetailsDto
                    {
                        RedemptionId = ur.RedemptionId,
                        UserId = ur.UserId,
                        FullName = ur.User.FullName,
                        Email = ur.User.Email,
                        PointsUsed = ur.PointsUsed,
                        RedemptionDate = ur.RedemptionDate,
                        Status = ur.Status.ToString(),
                        Reward = new RewardDto
                        {
                            RewardId = ur.Reward.RewardId,
                            RewardType = ur.Reward.RewardType,
                            RewardTitle = ur.Reward.RewardTitle,
                            RewardDescription = ur.Reward.RewardDescription,
                            RewardCode = ur.Reward.RewardCode,
                            RewardPercentage = ur.Reward.RewardPercentage,
                            MinimumPurchaseAmount = ur.Reward.MinimumPurchaseAmount,
                            MaximumDiscountCap = ur.Reward.MaximumDiscountCap,
                            ExpirationDate = ur.Reward.ExpirationDate,
                            StartDate = ur.Reward.StartDate,
                            UsageLimit = ur.Reward.UsageLimit,
                            RewardStatus = ur.Reward.Status,
                            LoyaltyPointsRequired = ur.Reward.LoyaltyPointsRequired
                        }
                    })
                    .ToListAsync();

                return Ok(allRedemptions);
            }
            else
            {
                var userRedemptions = await _context.UserRedemptions
                    .Where(ur => ur.UserId == userId)
                    .Include(ur => ur.Reward)
                    .Select(ur => new UserRedemptionDto
                    {
                        RedemptionId = ur.RedemptionId,
                        UserId = ur.UserId,
                        PointsUsed = ur.PointsUsed,
                        RedemptionDate = ur.RedemptionDate,
                        Status = ur.Status.ToString(),
                        Reward = new RewardDto
                        {
                            RewardId = ur.Reward.RewardId,
                            RewardType = ur.Reward.RewardType,
                            RewardTitle = ur.Reward.RewardTitle,
                            RewardDescription = ur.Reward.RewardDescription,
                            RewardCode = ur.Reward.RewardCode,
                            RewardPercentage = ur.Reward.RewardPercentage,
                            MinimumPurchaseAmount = ur.Reward.MinimumPurchaseAmount,
                            MaximumDiscountCap = ur.Reward.MaximumDiscountCap,
                            ExpirationDate = ur.Reward.ExpirationDate,
                            StartDate = ur.Reward.StartDate,
                            UsageLimit = ur.Reward.UsageLimit,
                            RewardStatus = ur.Reward.Status,
                            LoyaltyPointsRequired = ur.Reward.LoyaltyPointsRequired
                        }
                    })
                    .ToListAsync();

                return Ok(userRedemptions);
            }
        }

        public class UserRedemptionDto
        {
            public int RedemptionId { get; set; }
            public int UserId { get; set; }
            public int PointsUsed { get; set; }
            public DateTime RedemptionDate { get; set; }
            public string Status { get; set; }
            public RewardDto Reward { get; set; }
        }

        public class UserRedemptionWithDetailsDto : UserRedemptionDto
        {
            public string FullName { get; set; }
            public string Email { get; set; }
        }

        public class RewardDto
        {
            public int RewardId { get; set; }
            public string RewardType { get; set; }
            public string RewardTitle { get; set; }
            public string RewardDescription { get; set; }
            public string RewardCode { get; set; }
            public decimal RewardPercentage { get; set; }
            public decimal MinimumPurchaseAmount { get; set; }
            public decimal MaximumDiscountCap { get; set; }
            public DateTime ExpirationDate { get; set; }
            public DateTime StartDate { get; set; }
            public int UsageLimit { get; set; }
            public string RewardStatus { get; set; }
            public int? LoyaltyPointsRequired { get; set; }
        }
        // Helper method to check user eligibility
        private static bool IsUserEligibleForReward(User user, Reward reward)
        {
            // Implement logic to check if the user is eligible for the reward
            // For example, check if the user has enough loyalty points
            if (reward.LoyaltyPointsRequired != null && user.TotalPoints < reward.LoyaltyPointsRequired)
                return false;

            // Add other eligibility checks as needed
            return true;
        }
    }

}
