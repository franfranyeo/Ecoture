using Ecoture.Model.Request;
using Ecoture.Model.Response;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Request
{
    public class EditProfileRequest
    {
        [MinLength(2), MaxLength(100)]
        [RegularExpression(@"^[A-Za-z\s'\-.,]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string? FirstName { get; set; }

        [MinLength(2), MaxLength(100)]
        [RegularExpression(@"^[A-Za-z\s'\-.,]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string? LastName { get; set; }

        [EmailAddress, MaxLength(255)]
        public string? Email { get; set; }

        [RegularExpression(@"^\+65 [89]\d{3} \d{4}$", ErrorMessage = "Phone number must be in format: +65 XXXX XXXX")]
        public string? MobileNo { get; set; }
        public DateTime? DateofBirth { get; set; }
        public string? PfpURL { get; set; }
        public bool? Is2FAEnabled { get; set; }
        public MfaResponse? MFAMethods { get; set; }
        public bool? IsEmailVerified { get; set; }
        public bool? IsPhoneVerified { get; set; }
    }
}
