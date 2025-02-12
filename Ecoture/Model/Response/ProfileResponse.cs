namespace Ecoture.Model.Response
{
    public class ProfileResponse
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string MobileNo { get; set; }
        public DateTime? DateofBirth { get; set; }
        public string PfpURL { get; set; }
        public bool Is2FAEnabled { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public DateTime UpdatedAt { get; set; }
        public MfaResponse MfaMethods { get; set; }
    }
}
