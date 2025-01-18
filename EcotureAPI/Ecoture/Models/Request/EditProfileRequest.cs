using Ecoture.Models.Request;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcotureAPI.Models.Request
{
    public class EditProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? MobileNo { get; set; }
        public DateTime? DateofBirth { get; set; }
        public string? PfpURL { get; set; }
        public bool? Is2FAEnabled { get; set; }
        public List<string>? MFAMethods { get; set; }
        public bool? IsEmailVerified { get; set; }
        public bool? IsPhoneVerified { get; set; }
    }
}
