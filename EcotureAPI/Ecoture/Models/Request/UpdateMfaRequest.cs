namespace EcotureAPI.Models.Request
{
    public class UpdateMfaRequest
    {
        public int UserId { get; set; }
        public List<string> MfaTypes { get; set; } // List of MFA types to enable or disable
        public bool Enable { get; set; } // True to enable, false to disable
    }
}
