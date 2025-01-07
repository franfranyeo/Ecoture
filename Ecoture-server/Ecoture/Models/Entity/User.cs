using Ecoture.Models.Enum;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace Models.Entity
{
    public class User
    {
        public int userId { get; set; }

        [MaxLength(100)]
        public string firstName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string lastName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string email { get; set; } = string.Empty;

        [MaxLength(255), JsonIgnore]
        public string password { get; set; } = string.Empty;

        [MaxLength(20)]
        public string mobileNo { get; set; } = string.Empty;

        [Column(TypeName = "date")]
        public DateTime dateofBirth { get; set; }

        public UserRole role { get; set; } = UserRole.Customer; // default role is customer

        [MaxLength(255)]
        public string? pfpURL { get; set; } 

        [Column(TypeName = "datetime")]
        public DateTime lastLogin { get; set; }

        public bool is2FAEnabled { get; set; } = false;

        public bool isEmailVerified { get; set; } = false;

        [MaxLength(10)]
        public string? referralCode { get; set; }

        public bool agreedToTerms { get; set; } = false;

        [Column(TypeName = "datetime")]
        public DateTime? agreedToTermsAt { get; set; }

        public bool deleteRequested { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? deleteRequestedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime createdAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime updatedAt { get; set; }

        public Membership? Membership { get; set; }

        public ICollection<Referral> ReferralsSent { get; set; } = new List<Referral>(); // Referrals made by the user

        public ICollection<Referral> ReferralsReceived { get; set; } = new List<Referral>(); // Referrals received by the user

        public ICollection<PointsTransaction> PointsTransactions { get; set; } = new List<PointsTransaction>(); // Points-related transactions

        public ICollection<UserRedemptions> UserRedemptions { get; set; } = new List<UserRedemptions>(); // Redemption records
    }
}
