using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Models
{
    public class Membership
    {
        public int membershipId { get; set; }

        [MaxLength(20)]
        public string tier { get; set; } = "Bronze"; // Default tier

        [Column(TypeName = "decimal(10,2)")]
        public decimal totalSpent { get; set; } = 0.00M;

        public int totalPoints { get; set; } = 0;

        [Column(TypeName = "datetime")]
        public DateTime membershipStartDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime membershipEndDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime lastTierUpgradeDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime createdAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime updatedAt { get; set; }

        public int userId { get; set; }

        public User User { get; set; } = null!;
    }
}
