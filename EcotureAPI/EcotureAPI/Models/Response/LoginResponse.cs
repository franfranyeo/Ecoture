using EcotureAPI.Models.Entity;

namespace EcotureAPI.Models.Response
{
    public class LoginResponse
    {
        public User User { get; set; }
        public string AccessToken { get; set; }
    }
}
