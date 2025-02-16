namespace Ecoture.Model.DTO
{
    public class RefundRequestDTO
    {
        public int Id { get; set; }
        public int OrderItemId { get; set; } // ✅ Ensure it's correctly mapped
        public int UserId { get; set; } // ✅ Ensure this is included
        public string Reason { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
