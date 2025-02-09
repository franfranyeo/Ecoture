using Ecoture.Model.Entity;

namespace Ecoture.Model.Response
{
    public class LoginResponse
    {
        public User User { get; set; }
        public string AccessToken { get; set; }
        public MfaResponse MfaMethods { get; set; }
    }
}

