using System.ComponentModel.DataAnnotations;

namespace Ecoture.Models.Request
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
        /// Quantity of the product in stock (optional, must be a non-negative value if provided).
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "StockQuantity must be a non-negative value.")]
        public int? StockQuantity { get; set; }

        /// <summary>
        /// Product category name (optional, must not exceed 50 characters if provided).
        /// </summary>
        [MaxLength(50)]
        public string? CategoryName { get; set; }

        /// <summary>
        /// List of product colors (optional, at least one color if provided).
        /// </summary>
        public List<string>? Colors { get; set; } // List of colors for the product

        /// <summary>
        /// Product fit (optional, must not exceed 30 characters if provided).
        /// </summary>
        [MaxLength(30)]
        public string? Fit { get; set; }

        /// <summary>
        /// Image file name (optional, must not exceed 20 characters if provided).
        /// </summary>
        [MaxLength(20)]
        public string? ImageFile { get; set; }

        /// <summary>
        /// List of sizes and their stock quantities (optional).
        /// </summary>
        public List<SizeRequest>? Sizes { get; set; } // Reference the centralized SizeRequest class
    }
}
