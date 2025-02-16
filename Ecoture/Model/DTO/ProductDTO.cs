using System;
using Ecoture.Model.DTO;
using Ecoture.Model.Enum;

namespace Ecoture.Model.DTO
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

        public int StockQuantity { get; set; } // Total stock count (calculated dynamically)

        public PriceRange PriceRange { get; set; } // Enum for price range

        public string? ImageFile { get; set; } // URL or filename of the product image

        public DateTime CreatedAt { get; set; } // Product creation timestamp

        public DateTime UpdatedAt { get; set; } // Product last update timestamp

        public int UserId { get; set; } // Identifier for the user who created the product

        public UserBasicDTO? User { get; set; } // Basic user details as a nested DTO

        /// <summary>
        /// List of size and color combinations with stock quantities.
        /// </summary>
        public List<ProductSizeColorDTO> SizeColors { get; set; } = new(); // List of product size-color stock mappings

        public List<FitDTO> Fits { get; set; } = new(); // List of product fits

        public List<CategoryDTO> Categories { get; set; } = new(); // List of product categories
    }

    

    /// <summary>
    /// Data Transfer Object for Fit details.
    /// </summary>
    public class FitDTO
    {
        public string FitName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Data Transfer Object for Category details.
    /// </summary>
    public class CategoryDTO
    {
        public string CategoryName { get; set; } = string.Empty;
    }
}
