using Ecoture.Model.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Ecoture.Model.Entity
{
    public class UserRedemptions
    {
        public int RedemptionId { get; set; }

        public int UserId { get; set; }

        public int RewardId { get; set; }

        public int PointsUsed { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime RedemptionDate { get; set; }

        [Required]
        [MaxLength(50)]
        public RedemptionStatus Status { get; set; } = RedemptionStatus.Unused; // default value 

        public User User { get; set; } = null!;
        [JsonIgnore]
        public Reward Reward { get; set; } = null!;
    }
}
