using Microsoft.AspNetCore.Mvc;
using Ecoture.Model.Entity;
using Ecoture.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

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
            var rewards = await _context.Rewards.ToListAsync();
            return Ok(rewards);
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
    }
}
