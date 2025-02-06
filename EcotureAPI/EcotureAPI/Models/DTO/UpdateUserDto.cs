namespace EcotureAPI.Models.DTO
{
    public class UpdateUserDto
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string MobileNo { get; set; }
        public bool Is2FAEnabled { get; set; }
        public List<string> MFAMethods { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
    }

}
