using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Entity
{
    public class CreditCard
    {
        public int Id { get; set; }

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

        public int UserId { get; set; } // Foreign Key
        public User? User { get; set; } // Navigation Property
    }
}
