using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
    public class Wishlist
    {
        [Key]
        public int Id { get; set; } // Primary Key

        [Required]
        public int UserId { get; set; } // Foreign Key for User

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        [Required]
        public int ProductId { get; set; } // Foreign Key for Product

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Timestamp
    }
}
