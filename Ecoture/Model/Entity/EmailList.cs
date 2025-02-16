using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Entity
{
    public class EmailList
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    }
}
