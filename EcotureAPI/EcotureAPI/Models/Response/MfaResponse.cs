namespace EcotureAPI.Models.Response
{
    public class MfaResponse
    {
        public int UserId { get; set; }
        // Different MFA types with default values set to false
        public bool Sms { get; set; } = false;
        public bool Email { get; set; } = false;
        public bool Authenticator { get; set; } = false;
    }
}
