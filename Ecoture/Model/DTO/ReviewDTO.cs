namespace Ecoture.Models.DTO
{
    public class ReviewDTO
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Comment { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Username { get; set; } = string.Empty; // Reviewer’s Name
        public DateTime CreatedAt { get; set; }
    }
}
