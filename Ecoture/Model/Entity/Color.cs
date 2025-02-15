// Model/Color.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace Ecoture.Model.Entity
{
    public class Color
    {
        public int Id { get; set; } // Primary Key

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        // Navigation property for many-to-many relationship with products
        public List<ProductSizeColor> ProductSizeColors { get; set; } = new();
    }
}
