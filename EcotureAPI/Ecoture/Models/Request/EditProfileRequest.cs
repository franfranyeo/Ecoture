using Ecoture.Models.Request;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcotureAPI.Models.Request
{
    public class EditProfileRequest
    {
        [MinLength(2), MaxLength(100)]
        [RegularExpression(@"^[A-Za-z\s'\-.,]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        [RegularExpression(@"^[A-Za-z\s'\-.,]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string? LastName { get; set; }

        [EmailAddress, MaxLength(255)]
        public string? Email { get; set; }

        [MinLength(8), MaxLength(50)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$", ErrorMessage = "At least 1 digit, 1 uppercase letter, 1 lowercase letter, 1 special character, no spaces, and between 8 to 15 characters")]
        public string? Password { get; set; }

        [MaxLength(20)]
        [RegularExpression(@"^\+?[0-9\s]*$", ErrorMessage = "Mobile number can only contain digits, spaces, and an optional leading '+'.")]
        public string? MobileNo { get; set; }

        [Column(TypeName = "date")]
        [CustomValidation(typeof(EditProfileRequest), nameof(ValidateDateOfBirth))]
        public DateTime? DateofBirth { get; set; }

        [MaxLength(255)]
        public string? PfpURL { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? UpdatedAt { get; set; }


        // Custom validation for Date of Birth
        public static ValidationResult? ValidateDateOfBirth(DateTime? date, ValidationContext context)
        {
            if (date.HasValue && date.Value >= DateTime.UtcNow)
            {
                return new ValidationResult("Date of birth must be in the past.");
            }
            return ValidationResult.Success;
        }
    }
}
