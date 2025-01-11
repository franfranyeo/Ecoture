using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Request
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
