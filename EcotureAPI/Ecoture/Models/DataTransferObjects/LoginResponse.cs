using Models.Entity;

namespace EcotureAPI.Models.DataTransferObjects
{
    public class LoginResponse
    {
        public User User { get; set; }
        public string AccessToken { get; set; }
    }
}
