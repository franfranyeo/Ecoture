using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models.Entity
{
    public class Referral
    {
        public int referralId { get; set; }

        [ForeignKey(nameof(referrerUser))]
        public int referrerUserId { get; set; }

        [ForeignKey(nameof(refereeUser))]
        public int refereeUserId { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime referralDate { get; set; }

        // Navigation properties
        public User referrerUser { get; set; } = null!;
        public User refereeUser { get; set; } = null!;
    }
}
