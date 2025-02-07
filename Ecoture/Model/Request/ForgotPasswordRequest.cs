using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
