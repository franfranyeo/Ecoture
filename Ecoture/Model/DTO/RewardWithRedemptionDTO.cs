namespace Ecoture.Model.DTO
{
    public class RewardWithRedemptionsDTO
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
        public string Status { get; set; }
        public int? LoyaltyPointsRequired { get; set; }
        public List<UserRedemptionDTO> UserRedemptions { get; set; }
    }
}
