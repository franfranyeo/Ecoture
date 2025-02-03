namespace Ecoture.Models.Entity
{
    public class ProductSize
    {
        public int Id { get; set; } // Primary Key

        public int ProductId { get; set; } // Foreign Key
        public Product Product { get; set; } = null!;

        public int SizeId { get; set; } // Foreign Key
        public Size Size { get; set; } = null!;

        public int StockQuantity { get; set; } // Stock for this product-size combination
    }

}
