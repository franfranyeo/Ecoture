using Ecoture.Model;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
    public class PointsTransaction
    {
        public int TransactionId { get; set; }

        public int UserId { get; set; }

        public int PointsEarned { get; set; }
        public int PointsSpent { get; set; }

        [MaxLength(50)]
        public string TransactionType { get; set; } = string.Empty; // e.g., "Referral", "Order", "Review"

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime ExpiryDate { get; set; }

        public int? RewardId { get; set; }

        public int? OrderId { get; set; }

        public int? ReferralId { get; set; }

        public int? ReviewId { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public Reward? Reward { get; set; }
        public Referral? Referral { get; set; }
    }
}
