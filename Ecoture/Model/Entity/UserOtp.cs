using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Entity
{
    public class UserOtp
    {
        public int Id { get; set; }  // Unique identifier for the token (Guid)

        public int UserId { get; set; }  // User this token is related to

        public string Otp { get; set; }  // Token string

        [MaxLength(50)]
        public string OtpType { get; set; }  // Type of token, e.g., "PasswordReset", "EmailConfirmation"

        public DateTime ExpirationDate { get; set; }  // When the token expires

        public DateTime CreatedAt { get; set; }  // When the token was created

        public bool IsVerified { get; set; }  // Flag if the token is used

        public string? Data { get; set; }

        public User User { get; set; } = null!;
    }
}
