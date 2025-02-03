using System;
using Ecoture.Models.Enum;

namespace Ecoture.Models.DTO
{
    /// <summary>
    /// Data Transfer Object for Product entity.
    /// </summary>
    public class ProductDTO
    {
        public int Id { get; set; } // Product Identifier

        public string Title { get; set; } = string.Empty; // Product Title

        public string Description { get; set; } = string.Empty; // Short Description

        public string LongDescription { get; set; } = string.Empty; // Detailed Description

        public decimal Price { get; set; } // Product Price

        public int StockQuantity { get; set; } // Total stock count (across all sizes)

        public string CategoryName { get; set; } = string.Empty; // Category of the product


        public string Fit { get; set; } = string.Empty; // Product Fit (e.g., Regular, Slim)

        public PriceRange PriceRange { get; set; } // Enum for price range

        public string? ImageFile { get; set; } // URL or filename of the product image

        public DateTime CreatedAt { get; set; } // Product creation timestamp

        public DateTime UpdatedAt { get; set; } // Product last update timestamp

        public int UserId { get; set; } // Identifier for the user who created the product

        public UserBasicDTO? User { get; set; } // Basic user details as a nested DTO

        /// <summary>
        /// List of sizes and their stock quantities for this product.
        /// </summary>
        public List<ProductSizeDTO> Sizes { get; set; } = new(); // List of sizes associated with the product
        public List<ProductColorDTO> Colors { get; set; } = new(); // List of product colors
    }

    /// <summary>
    /// Data Transfer Object for Product-Size relationship.
    /// </summary>
    public class ProductSizeDTO
    {
        public string SizeName { get; set; } = string.Empty; // Name of the size (e.g., S, M, L)
        public int StockQuantity { get; set; } // Stock quantity for this size
    }

    public class ProductColorDTO
    {
        public string ColorName { get; set; } = string.Empty;
    }
}
