using EcotureAPI.Models.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcotureAPI.Models.Entity
{
    public class UserRedemptions
    {
        public int RedemptionId { get; set; }

        public int UserId { get; set; }

        public int VoucherId { get; set; }

        public int PointsUsed { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime RedemptionDate { get; set; }

        [Required]
        [MaxLength(50)]
        public RedemptionStatus Status { get; set; } = RedemptionStatus.Unused; // default value 


        public User User { get; set; } = null!;
        public Voucher Voucher { get; set; } = null!;
    }
}
