using Ecoture.Model.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
    public class UserRedemptions
    {
        public int redemptionId { get; set; }

        public int userId { get; set; }

        public int voucherId { get; set; }

        public int pointsUsed { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime redemptionDate { get; set; }

        [Required]
        [MaxLength(50)]
        public RedemptionStatus status { get; set; } = RedemptionStatus.Unused; // default value 


        public User User { get; set; } = null!;
        public Reward Reward { get; set; } = null!;
    }
}
