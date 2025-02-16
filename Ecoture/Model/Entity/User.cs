using Ecoture.Model.Enum;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using System.Text.Json.Serialization;


namespace Ecoture.Model.Entity
{
    public class User
    {
        public int UserId { get; set; }

        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? LastName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(255), JsonIgnore]
        public string Password { get; set; } = string.Empty;

        [MaxLength(20)]
        public string MobileNo { get; set; } = string.Empty;

        [Column(TypeName = "date")]
        public DateTime? DateofBirth { get; set; }

        public UserRole Role { get; set; } = UserRole.Customer; // default role is customer

        [MaxLength(255)]
        public string? PfpURL { get; set; } 

        [Column(TypeName = "datetime")]
        public DateTime LastLogin { get; set; }

        public bool Is2FAEnabled { get; set; } = false;

        public bool IsEmailVerified { get; set; } = false;

        public bool IsPhoneVerified { get; set; } = false;

        public bool IsGoogleLogin { get; set; } = false;

        public decimal TotalSpending { get; set; } = 0.00m;

        public int TotalPoints { get; set; } = 0;

        public int MembershipId { get; set; } = 1;

        public DateTime? LastClaimTime { get; set; }

        public DateTime MembershipStartDate { get; set; } // When the user enrolled
        public DateTime? MembershipEndDate { get; set; } // For paid memberships with expiration

        [MaxLength(6)]
        public string? ReferralCode { get; set; }

        public bool DeleteRequested { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? DeleteRequestedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        public Membership Membership { get; set; }

        public ICollection<Referral> ReferralsReceived { get; set; } = new List<Referral>(); // Referrals received by the user

        public List<Referral>? ReferralsSent { get; set; }

        public List<PointsTransaction>? PointsTransactions { get; set; }

        public List<UserRedemptions>? UserRedemptions { get; set; }

        

        // Navigation property to represent the one-to-many relationship
        [JsonIgnore]
        public List<Product>? Products { get; set; }

        // Navigation property for Wishlist (One-to-Many)
        [JsonIgnore]
        public List<Wishlist>? Wishlists { get; set; } = new();


        // Computed property for full name with capitalization
        public string FullName
        {
            get
            {
                string firstName = !string.IsNullOrEmpty(FirstName)
                    ? CultureInfo.CurrentCulture.TextInfo.ToTitleCase(FirstName.ToLower())
                    : string.Empty;

                string lastName = !string.IsNullOrEmpty(LastName)
                    ? CultureInfo.CurrentCulture.TextInfo.ToTitleCase(LastName.ToLower())
                    : string.Empty;

                return $"{firstName} {lastName}".Trim();
            }
        }
    }

    public class RandomReferralCode
    {
        private static readonly Random _random = new();
        private const string _chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        public static string Generate()
        {
            return new string(Enumerable.Repeat(_chars, 6)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }
    }
}
