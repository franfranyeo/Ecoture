using EcotureAPI.Models.DTO;

namespace EcotureAPI.Models.Response
{
    public class AuthResponse
    {
        public UserDTO User { get; set; } = new UserDTO();
    }
}
