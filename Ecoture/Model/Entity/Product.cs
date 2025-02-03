using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Ecoture.Models.Entity;
using Ecoture.Models.Request;
using Ecoture.Models.Enum;
using Ecoture.Models.DTO;

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

        [Required, MaxLength(50)]
        public string CategoryName { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string Fit { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price Range is required.")]
        public PriceRange PriceRange { get; set; } // Enum for Price Range

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        // Foreign key property for User
        public int UserId { get; set; }

        // Navigation property to represent the one-to-many relationship with User
        public User? User { get; set; }

        // Navigation property for the many-to-many relationship with Sizes
        public List<ProductSize> ProductSizes { get; set; } = new();

        // Navigation property for the many-to-many relationship with Colors
        public List<ProductColor> ProductColors { get; set; } = new();

        // New Navigation Property: One-to-Many relationship with Reviews
        public List<Review> Reviews { get; set; } = new();
    }
}
