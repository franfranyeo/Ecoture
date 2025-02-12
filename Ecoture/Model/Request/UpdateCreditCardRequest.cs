using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
    public class UpdateCreditCardRequest
    {
        [MaxLength(100)]
        public string? CardHolderName { get; set; }

        [MaxLength(16)]
        public string? CardNumber { get; set; }

        public int? ExpiryMonth { get; set; }

        public int? ExpiryYear { get; set; }

        [MaxLength(3)]
        public string? CVV { get; set; }
    }
}
