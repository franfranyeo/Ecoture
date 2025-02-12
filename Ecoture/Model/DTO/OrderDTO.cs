namespace Ecoture.Model.DTO
{
    public class OrderDTO
    {
        public int Id { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDTO> OrderItems { get; set; }
    }
}

