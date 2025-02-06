// Models/ProductColor.cs
namespace EcotureAPI.Models.Entity
{
    public class ProductColor
    {
        public int Id { get; set; } // Primary Key

        public int ProductId { get; set; } // Foreign Key
        public Product Product { get; set; } = null!;

        public int ColorId { get; set; } // Foreign Key
        public Color Color { get; set; } = null!;
    }
}
