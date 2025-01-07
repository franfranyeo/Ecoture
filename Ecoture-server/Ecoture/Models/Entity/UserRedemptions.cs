using Ecoture.Models.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models.Entity
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
        public Voucher Voucher { get; set; } = null!;
    }
}
