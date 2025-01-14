using System.ComponentModel.DataAnnotations;


namespace Models.Request
{
    public class LoginRequest
    {
        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(50)]
        public string Password { get; set; } = string.Empty;
    }
}
