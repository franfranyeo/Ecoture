using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Request
{
    public class ChangePasswordRequest
    {
        [Required, MinLength(8), MaxLength(50)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$", ErrorMessage = "At least 1 digit, 1 uppercase letter, 1 lowercase letter, 1 special character, no spaces, and between 8 to 15 characters")]
        public string CurrentPassword { get; set; }

        [Required, MinLength(8), MaxLength(50)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$", ErrorMessage = "At least 1 digit, 1 uppercase letter, 1 lowercase letter, 1 special character, no spaces, and between 8 to 15 characters")]
        public string NewPassword { get; set; }

    }
}
