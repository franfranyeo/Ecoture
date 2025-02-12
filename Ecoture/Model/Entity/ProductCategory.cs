using Ecoture.Model.Entity;

namespace Ecoture.Model.Entity
{
    public class ProductCategory
    {
        public int Id { get; set; } // Primary Key

        public int ProductId { get; set; } // Foreign Key
        public Product Product { get; set; } = null!;

        public int CategoryId { get; set; } // Foreign Key
        public Category Category { get; set; } = null!;
    }
}
