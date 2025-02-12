using Ecoture.Model.DTO;

namespace Ecoture.Model.Response
{
    public class AuthResponse
    {
        public UserDTO User { get; set; } = new UserDTO();
    }
}
