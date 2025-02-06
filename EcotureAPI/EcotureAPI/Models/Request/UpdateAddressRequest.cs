using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Request
{
    public class UpdateAddressRequest
    {
        [MinLength(3), MaxLength(100)]
        public string? Title { get; set; }

        [MinLength(3), MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(20)]
        public string? ImageFile { get; set; }
    }
}
