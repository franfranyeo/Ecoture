using System.ComponentModel.DataAnnotations;

namespace Ecoture.Models.Entity
{
    public class Category
    {
        public int Id { get; set; } // Primary Key

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        // Navigation property for many-to-many relationship with products
        public List<ProductCategory> ProductCategories { get; set; } = new();
    }
}
