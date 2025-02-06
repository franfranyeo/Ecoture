using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcotureAPI.Models.Entity
{
    public class Voucher
    {
        public int VoucherId { get; set; }

        [MaxLength(10)]
        public string VoucherCode { get; set; } = string.Empty;

        [MaxLength(50)]
        public string VoucherType { get; set; } = string.Empty; // e.g. Discount, Cashback

        [Column(TypeName = "decimal(10,2)")]
        public decimal VoucherValue { get; set; }

        public int PointsRequired { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime StartDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsFirstTimeUseOnly { get; set; } = false;
        public bool IsOneTimeUseOnly { get; set; } = false;

        public int VoucherLimit { get; set; }

        [MaxLength(50)]
        public string VoucherTitle { get; set; } = string.Empty;

        [MaxLength(100)]
        public string VoucherDesc { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<PointsTransaction> PointsTransactions { get; set; } = new List<PointsTransaction>();
        public ICollection<UserRedemptions> UserRedemptions { get; set; } = new List<UserRedemptions>();
    }
}
