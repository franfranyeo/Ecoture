using EcotureAPI.Models.Enum;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Response
{
    public class EditUserResponse
    {
        public int UserId { get; set; }
        [MaxLength(100)]
        public string FirstName { get; set; }
        [MaxLength(100)]
        public string LastName { get; set; }
        [MaxLength(255)]
        public string Email { get; set; }
        [Column(TypeName = "date")]
        public DateTime? DateofBirth { get; set; }
        public UserRole Role { get; set; }
        [MaxLength(255)]
        public string PfpURL { get; set; }
    }
}
