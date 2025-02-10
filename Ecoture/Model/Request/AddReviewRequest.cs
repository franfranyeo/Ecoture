using System.ComponentModel.DataAnnotations;

namespace Ecoture.Models.Request
{
    public class AddReviewRequest
    {
        [Required]
        public int ProductId { get; set; }

        [Required, MaxLength(500)]
        public string Comment { get; set; } = string.Empty;

        [Required, Range(1, 5)]
        public int Rating { get; set; }
    }
}
