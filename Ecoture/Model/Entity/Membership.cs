using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
    public class Membership
    {
        public int MembershipId { get; set; }

        [MaxLength(20)]
        public string Tier { get; set; } = "Bronze"; // Default tier

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalSpent { get; set; } = 0.00M;

        public int TotalPoints { get; set; } = 0;

        [Column(TypeName = "datetime")]
        public DateTime MembershipStartDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime")]
        public DateTime? MembershipEndDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime LastTierUpgradeDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        public int UserId { get; set; }

        public User? User { get; set; } 
    }
}
