using EcotureAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcotureAPI.Models.Entity
{
    public class PointsTransaction
    {
        public int transactionId { get; set; }

        public int userId { get; set; }

        public int pointsEarned { get; set; }
        public int pointsSpent { get; set; }

        [MaxLength(50)]
        public string transactionType { get; set; } = string.Empty; // e.g., "Referral", "Order", "Review"

        [Column(TypeName = "datetime")]
        public DateTime createdAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime expiryDate { get; set; }

        public int? voucherId { get; set; }

        public int? orderId { get; set; }

        public int? referralId { get; set; }

        public int? reviewId { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public Voucher? Voucher { get; set; }
        public Referral? Referral { get; set; }
    }
}
