using System;

namespace Ecoture.Model.Entity
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; } // Foreign key
        public int ProductId { get; set; }
        public string ProductTitle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Color { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? ImageFile { get; set; }

        // Navigation property
        public Order Order { get; set; }
    }
}
