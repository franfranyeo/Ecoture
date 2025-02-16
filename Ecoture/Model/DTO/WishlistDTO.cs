namespace Ecoture.Model.DTO
{
    public class WishlistDTO
    {
        public int ProductId { get; set; }
        public string ProductTitle { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public decimal ProductPrice { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
