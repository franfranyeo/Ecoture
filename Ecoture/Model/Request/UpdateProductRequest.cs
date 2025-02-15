using System.ComponentModel.DataAnnotations;
using Ecoture.Model.Request;  // ✅ Import SizeColorRequest

namespace Ecoture.Model.Request
{
    /// <summary>
    /// Model to handle updating an existing product.
    /// </summary>
    public class UpdateProductRequest
    {
        /// <summary>
        /// Product title (optional, must be between 3 and 100 characters if provided).
        /// </summary>
        [MinLength(3), MaxLength(100)]
        public string? Title { get; set; }

        /// <summary>
        /// Short product description (optional, must be between 3 and 500 characters if provided).
        /// </summary>
        [MinLength(3), MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Detailed product description (optional, must be between 3 and 1000 characters if provided).
        /// </summary>
        [MinLength(3), MaxLength(1000)]
        public string? LongDescription { get; set; }

        /// <summary>
        /// Product price (optional, must be greater than 0 if provided).
        /// </summary>
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero.")]
        public decimal? Price { get; set; }

        /// <summary>
        /// List of product categories (optional, at least one category if provided).
        /// </summary>
        public List<string>? Categories { get; set; }

        /// <summary>
        /// List of product fits (optional, at least one fit if provided).
        /// </summary>
        public List<string>? Fits { get; set; }

        /// <summary>
        /// Image file name (optional, must not exceed 255 characters if provided).
        /// </summary>
        [MaxLength(255)]
        public string? ImageFile { get; set; }

        /// <summary>
        /// List of size and color combinations with stock quantities (optional).
        /// </summary>
        public List<SizeColorRequest>? SizeColors { get; set; }
    }
}
