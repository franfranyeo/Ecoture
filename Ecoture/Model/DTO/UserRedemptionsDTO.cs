using Ecoture.Model.Enum;

namespace Ecoture.Model.DTO
{
    public class UserRedemptionDTO
    {
        public int RedemptionId { get; set; }
        public int UserId { get; set; }
        public int RewardId { get; set; }
        public int PointsUsed { get; set; }
        public DateTime RedemptionDate { get; set; }
        public RedemptionStatus Status { get; set; }
    }
}
