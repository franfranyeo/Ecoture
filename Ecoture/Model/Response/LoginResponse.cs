using Ecoture.Model.DTO;
using Ecoture.Model.Entity;

namespace Ecoture.Model.Response
{
    public class LoginResponse
    {
        public UserDTO User { get; set; }
        public string AccessToken { get; set; }
        public MfaResponse MfaMethods { get; set; }
        public Membership Membership { get; set; }
    }
}

