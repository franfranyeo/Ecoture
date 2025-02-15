using System.ComponentModel.DataAnnotations;
using Ecoture.Model.Request;  // ✅ Import SizeColorRequest

namespace Ecoture.Model.Request
{
    /// <summary>
    /// Request model to add a new product.
    /// </summary>
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

        /// <summary>
        /// List of product categories.
        /// </summary>
        [Required, MinLength(1, ErrorMessage = "At least one category must be provided.")]
        public List<string> Categories { get; set; } = new();

        /// <summary>
        /// List of product fits.
        /// </summary>
        [Required, MinLength(1, ErrorMessage = "At least one fit must be provided.")]
        public List<string> Fits { get; set; } = new();

        /// <summary>
        /// Image file URL or path.
        /// </summary>
        [MaxLength(255)]
        public string? ImageFile { get; set; }

        /// <summary>
        /// List of size and color combinations with stock quantities.
        /// </summary>
        [Required, MinLength(1, ErrorMessage = "At least one size-color combination must be provided.")]
        public List<SizeColorRequest> SizeColors { get; set; } = new();
    }
}
