using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
    public class RefundRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderItemId { get; set; }  // Reference to the specific order item

        [Required]
        public int UserId { get; set; } // User who requested the refund

        [Required]
        public string Reason { get; set; } // Refund reason provided by the user

        [Required]
        public string Status { get; set; } = "Pending"; // Default status is "Pending"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("OrderItemId")]
        public OrderItem OrderItem { get; set; }  // Navigation property
    }
}
