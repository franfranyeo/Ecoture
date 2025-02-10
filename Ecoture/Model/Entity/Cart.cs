using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Models.Entity
{
    public class Cart
    {
        [Key]
        public int Id { get; set; } // Cart item ID

        [Required]
        public int UserId { get; set; } // Foreign key to Users table
        public User? User { get; set; } // 🔹 Make sure this property exists

        [Required]
        public int ProductId { get; set; } // Foreign key to Products table
        public Product? Product { get; set; } // 🔹 Make sure this property exists

        [Required]
        [MaxLength(255)]
        public string ProductTitle { get; set; } = string.Empty; // Store product name

        [Required]
        public decimal Price { get; set; } // Price at the time of adding to cart

        [MaxLength(50)]
        public string Color { get; set; } = string.Empty; // Selected color

        [MaxLength(10)]
        public string Size { get; set; } = string.Empty; // Selected size

        [MaxLength(500)]
        public string? ImageFile { get; set; } // Product image URL

        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; } = 1; // Default quantity is 1

        public DateTime CreatedAt { get; set; } = DateTime.Now; // Timestamp
    }
}
