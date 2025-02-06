using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Request
{
    public class GoogleLoginRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }
}
