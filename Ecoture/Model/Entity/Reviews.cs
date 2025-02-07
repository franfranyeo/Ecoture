using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
    public class Review
    {
        public int Id { get; set; } // Primary Key

        [Required]
        public int ProductId { get; set; } // Foreign Key to Product

        [Required]
        [MaxLength(500)]
        public string Comment { get; set; } = string.Empty; // Review Comment

        [Required]
        public int UserId { get; set; } // Foreign Key to User

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; } // Rating (1-5)

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.Now; // Timestamp

        // Navigation Properties
        public Product? Product { get; set; }
        public User? User { get; set; }
    }
}
