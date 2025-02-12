using Ecoture.Model.Entity;
using System;
using System.Collections.Generic;

namespace Ecoture.Model.Entity
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalPrice { get; set; }

        // Relationship: One Order → Many OrderItems
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
