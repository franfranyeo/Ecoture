using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
    public class GoogleLoginRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }
}
