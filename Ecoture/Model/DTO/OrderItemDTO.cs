namespace Ecoture.Model.DTO
{
    public class OrderItemDTO
    {
        public int ProductId { get; set; }
        public required string ProductTitle { get; set; }
        public decimal Price { get; set; }
        public required string Color { get; set; }
        public required string Size { get; set; }
        public int Quantity { get; set; }
        public required string ImageFile { get; set; }
    }
}
