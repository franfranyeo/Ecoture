using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
    /// <summary>
    /// Represents the many-to-many relationship between Product, Size, and Color.
    /// </summary>
    public class ProductSizeColor
    {
        [Key]
        public int Id { get; set; } // Primary Key

        // 🔹 Foreign Key for Product
        [Required]
        public int ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; } = null!;

        // 🔹 Foreign Key for Color
        [Required]
        public int ColorId { get; set; }

        [ForeignKey(nameof(ColorId))]
        public virtual Color Color { get; set; } = null!;

        // 🔹 Foreign Key for Size
        [Required]
        public int SizeId { get; set; }

        [ForeignKey(nameof(SizeId))]
        public virtual Size Size { get; set; } = null!;

        // 🔹 Stock count for this specific color-size combination
        [Required, Range(0, int.MaxValue, ErrorMessage = "Stock Quantity must be a non-negative value.")]
        public int StockQuantity { get; set; }
    }
}
