using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
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

        // Support multiple categories instead of a single one
        [Required, MinLength(1, ErrorMessage = "At least one category must be provided.")]
        public List<string> Categories { get; set; } = new();

        // Support multiple colors
        [Required, MinLength(1, ErrorMessage = "At least one color must be provided.")]
        public List<string> Colors { get; set; } = new();

        // Support multiple fits instead of a single one
        [Required, MinLength(1, ErrorMessage = "At least one fit must be provided.")]
        public List<string> Fits { get; set; } = new();

        [MaxLength(255)]
        public string? ImageFile { get; set; }

        // New property to handle multiple sizes and their stock quantities
        [Required]
        public List<SizeRequest> Sizes { get; set; } = new(); // Reference the centralized SizeRequest class
    }
}
