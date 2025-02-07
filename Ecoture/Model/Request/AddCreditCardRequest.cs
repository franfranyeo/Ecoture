using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
    public class AddCreditCardRequest
    {
        [Required, MaxLength(100)]
        public string CardHolderName { get; set; } = string.Empty;

        [Required, MaxLength(16)]
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        public int ExpiryMonth { get; set; }

        [Required]
        public int ExpiryYear { get; set; }

        [Required, MaxLength(3)]
        public string CVV { get; set; } = string.Empty;
    }
}
