namespace Ecoture.Model.Entity
{
    public class Size
    {
        public int Id { get; set; } // Primary Key
        public string Name { get; set; } = string.Empty; // e.g., S, M, L, XL, etc.

        // Navigation property for the many-to-many relationship with Product
        public List<ProductSize> ProductSizes { get; set; } = new();
    }
}
