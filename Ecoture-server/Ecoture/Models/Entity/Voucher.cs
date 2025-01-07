using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models.Entity
{
    public class Voucher
    {
        public int voucherId { get; set; }

        [MaxLength(10)]
        public string voucherCode { get; set; } = string.Empty;

        [MaxLength(50)]
        public string voucherType { get; set; } = string.Empty; // e.g. Discount, Cashback

        [Column(TypeName = "decimal(10,2)")]
        public decimal voucherValue { get; set; }

        public int pointsRequired { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime startDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime endDate { get; set; }

        public bool isActive { get; set; } = true;
        public bool isFirstTimeUseOnly { get; set; } = false;
        public bool isOneTimeUseOnly { get; set; } = false;

        public int voucherLimit { get; set; }

        [MaxLength(50)]
        public string voucherTitle { get; set; } = string.Empty;

        [MaxLength(100)]
        public string voucherDesc { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<PointsTransaction> PointsTransactions { get; set; } = new List<PointsTransaction>();
        public ICollection<UserRedemptions> UserRedemptions { get; set; } = new List<UserRedemptions>();
    }
}
