namespace Ecoture.Model.DTO
{
    public class UserDTO
    {
        public int UserId { get; set; } // Maps to UserId in the User entity
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty; // Combines FirstName and LastName
        public string Email { get; set; } = string.Empty;
        public string MobileNo { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string Role { get; set; } = string.Empty; // Maps to UserRole enum as a string
        public string? PfpURL { get; set; }
        public decimal TotalSpending { get; set; } = 0.00m;
        public int TotalPoints { get; set; } = 0;
        public string MembershipTier { get; set; } = string.Empty; // Maps to Membership.Tier
        public DateTime MembershipStartDate { get; set; }
        public DateTime? MembershipEndDate { get; set; }
        public string? ReferralCode { get; set; }
        public bool Is2FAEnabled { get; set; } = false;
        public bool IsEmailVerified { get; set; } = false;
        public bool IsPhoneVerified { get; set; } = false;
        public bool IsGoogleLogin { get; set; } = false;
        public DateTime LastLogin { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
