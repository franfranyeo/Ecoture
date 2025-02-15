using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Entity
{
    public class Size
    {
        [Key]
        public int Id { get; set; } // Primary Key

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty; // e.g., S, M, L, XL, etc.

        // Navigation property for the many-to-many relationship with ProductSizeColor
        public virtual List<ProductSizeColor> ProductSizeColors { get; set; } = new();
    }
}
