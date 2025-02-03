using System.ComponentModel.DataAnnotations;

namespace Ecoture.Models.Request
{
    public class AddProductRequest
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(1000)]
        public string LongDescription { get; set; } = string.Empty;

        [Required, Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero.")]
        public decimal Price { get; set; }

        [Required, MaxLength(50)]
        public string CategoryName { get; set; } = string.Empty;

        // Change single Colour to a list of colors
        [Required, MinLength(1, ErrorMessage = "At least one color must be provided.")]
        public List<string> Colors { get; set; } = new();

        [Required, MaxLength(30)]
        public string Fit { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        // New property to handle multiple sizes and their stock quantities
        [Required]
        public List<SizeRequest> Sizes { get; set; } = new(); // Reference the centralized SizeRequest class
    }
}
