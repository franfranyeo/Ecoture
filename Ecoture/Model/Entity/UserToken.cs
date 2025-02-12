using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Entity
{
    public class UserToken
    {
        public int Id { get; set; }  // Unique identifier for the token (Guid)

        public int UserId { get; set; }  // User this token is related to

        public string Token { get; set; }  // Token string

        [MaxLength(50)]
        public string TokenType { get; set; }  // Type of token, e.g., "PasswordReset", "EmailConfirmation"

        public DateTime ExpirationDate { get; set; }  // When the token expires

        public DateTime CreatedAt { get; set; }  // When the token was created

        public bool IsUsed { get; set; }  // Flag if the token is used

        public User User { get; set; } = null!;
    }
}
