using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Request
{
    /// <summary>
    /// Centralized class for handling size requests.
    /// </summary>
    public class SizeRequest
    {
        [Required, MaxLength(20)]
        public string SizeName { get; set; } = string.Empty; // Name of the size (e.g., S, M, L)

        [Required, Range(0, int.MaxValue, ErrorMessage = "Stock Quantity must be a non-negative value.")]
        public int StockQuantity { get; set; } // Stock for this size
    }
}
