using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Entity
{
    public class Reward
    {
        public int RewardId { get; set; } // 1. Reward ID
        public string RewardType { get; set; } // 2. Reward Type
        public string RewardTitle { get; set; } // 3. Reward Title
        public string RewardDescription { get; set; } // 4. Reward Description
        public string RewardCode { get; set; } // 5. Reward Code
        public decimal RewardPercentage { get; set; } // 6. Reward Percentage/Amount
        public decimal MinimumPurchaseAmount { get; set; } // 7. Minimum Purchase Amount
        public decimal MaximumDiscountCap { get; set; } // 8. Maximum Discount Cap
        public DateTime ExpirationDate { get; set; } // 9. Expiration Date
        public DateTime StartDate { get; set; } // 10. Start Date
        public int UsageLimit { get; set; } // 11. Usage Limit
        public string ApplicableProducts { get; set; } // 12. Applicable Products/Categories
        public string Exclusions { get; set; } // 13. Exclusions
        public string UserEligibility { get; set; } // 14. User Eligibility
        public bool IsStackable { get; set; } // 15. Stackable
        public bool AutoApply { get; set; } // 16. Auto-Apply
        public string Status { get; set; } // 17. Status

        // Optional Attributes (Nullable)
        public string? RewardImage { get; set; } // 18. Reward Image (nullable)
        public int? LoyaltyPointsRequired { get; set; } // 20. Loyalty Points Required (nullable)
        public DateTime? CreatedAt { get; set; } // 23. Created At (nullable)
        public DateTime? UpdatedAt { get; set; } // 24. Updated At (nullable)
        public string? CreatedBy { get; set; } // 25. Created By (nullable)

        public ICollection<PointsTransaction> PointsTransactions { get; set; } = new List<PointsTransaction>();
        public ICollection<UserRedemptions> UserRedemptions { get; set; } = new List<UserRedemptions>();
    }
}
