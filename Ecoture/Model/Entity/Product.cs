using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Ecoture.Models.Enum;

namespace Ecoture.Models.Entity
{
    public class Product
    {
        public int Id { get; set; } // Primary Key

        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(1000)]
        public string LongDescription { get; set; } = string.Empty;

        [Required, Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        [Required, Range(0, int.MaxValue, ErrorMessage = "Stock Quantity must be a non-negative value.")]
        public int StockQuantity { get; set; }

        [Required(ErrorMessage = "Price Range is required.")]
        public PriceRange PriceRange { get; set; } // Enum for Price Range

        [MaxLength(255)]
        public string? ImageFile { get; set; } // URL or filename for the product image

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Auto-assign default value

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Auto-assign default value

        // Foreign key property for User
        public int UserId { get; set; }

        // Navigation property to represent the one-to-many relationship with User
        public virtual User? User { get; set; }

        // Navigation property for the many-to-many relationship with Sizes
        public virtual List<ProductSize> ProductSizes { get; set; } = new();

        // Navigation property for the many-to-many relationship with Colors
        public virtual List<ProductColor> ProductColors { get; set; } = new();

        // Navigation property for the many-to-many relationship with Fits
        public virtual List<ProductFit> ProductFits { get; set; } = new();

        // Navigation property for the many-to-many relationship with Categories
        public virtual List<ProductCategory> ProductCategories { get; set; } = new();

        // Navigation property for the one-to-many relationship with Reviews
        public virtual List<Review> Reviews { get; set; } = new();
    }
}
