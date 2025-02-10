using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Entity
{
    public class Reward
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
        public string ApplicableProducts { get; set; } 
        public string Exclusions { get; set; }
        public string UserEligibility { get; set; } 
        public bool IsStackable { get; set; } 
        public bool AutoApply { get; set; } 
        public string Status { get; set; }
        public string? RewardImage { get; set; }
        public int? LoyaltyPointsRequired { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }

        public ICollection<PointsTransaction> PointsTransactions { get; set; } = new List<PointsTransaction>();
        public ICollection<UserRedemptions> UserRedemptions { get; set; } = new List<UserRedemptions>();
    }
}
