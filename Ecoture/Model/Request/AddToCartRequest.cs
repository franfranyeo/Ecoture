using System.ComponentModel.DataAnnotations;

namespace Ecoture.Models.Request
{
    public class AddToCartRequest
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public string ProductTitle { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public string Color { get; set; } = string.Empty;

        [Required]
        public string Size { get; set; } = string.Empty;

        public string? ImageFile { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; } = 1;
    }
}
