using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
    public class AddToWishlistRequest
    {
        [Required]
        public int ProductId { get; set; }
    }
}
