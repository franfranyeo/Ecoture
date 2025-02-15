using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
    /// <summary>
    /// Request model for specifying size, color, and stock quantity.
    /// </summary>
    public class SizeColorRequest
    {
        [Required, MaxLength(20)]
        public string SizeName { get; set; } = string.Empty; // e.g., S, M, L

        [Required, MaxLength(50)]
        public string ColorName { get; set; } = string.Empty; // e.g., Red, Blue

        [Required, Range(0, int.MaxValue, ErrorMessage = "Stock Quantity must be a non-negative value.")]
        public int StockQuantity { get; set; } // Stock for this size-color combination
    }
}
