using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Models.Request
{
    public class UpdateUserInfoRequest
    {
        [Required, MinLength(2), MaxLength(100)]
        [RegularExpression(@"^[\p{L} '-,.]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string firstName { get; set; } = string.Empty;

        [Required, MinLength(2), MaxLength(100)]
        [RegularExpression(@"^[\p{L} '-,.]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string lastName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(255)]
        public string email { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(50)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$", ErrorMessage = "At least 1 digit, 1 uppercase letter, 1 lowercase letter, 1 special character, no spaces and between 8 to 15 characters")]
        public string password { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        [RegularExpression(@"^\+?[0-9\s]*$", ErrorMessage = "Mobile number can only contain digits, spaces, and an optional leading '+'.")]
        public string mobileNo { get; set; } = string.Empty;

        [Column(TypeName = "date")]
        [CustomValidation(typeof(UpdateUserInfoRequest), nameof(ValidateDateOfBirth))]
        public DateTime dateofBirth { get; set; }

        [MaxLength(255)]
        public string? pfpURL { get; set; }

        // still have address attributes not added yet. waiting for ahmed

        [Column(TypeName = "datetime")]
        public DateTime updatedAt { get; set; }


        // custom validation for DOB to make sure it's in the past
        public static ValidationResult? ValidateDateOfBirth(DateTime date, ValidationContext context)
        {
            if (date >= DateTime.UtcNow)
            {
                return new ValidationResult("Date of birth must be in the past.");
            }
            return ValidationResult.Success;
        }
    }
}
