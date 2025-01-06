using Ecoture.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;


namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController(MyDbContext context, IConfiguration configuration) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        private readonly IConfiguration _configuration = configuration;


        // REGISTER USER
        [HttpPost("register")] // URL path for the HTTP Post method is “register”.
        public IActionResult Register(RegisterRequest request)
        {
            // trim string values
            request.firstName = request.firstName.Trim();
            request.lastName = request.lastName.Trim();
            request.email = request.email.Trim();
            request.password = request.password.Trim();

            // Check if user already exists
            var userExists = _context.Users.Any(u => u.email == request.email);
            if (userExists)
            {
                string message = "Email already exists.";
                return BadRequest(new { message });
            }


            // Create user object 
            var now = DateTime.Now;
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.password);
            var user = new User()
            {
                firstName = request.firstName,
                lastName = request.lastName,
                email = request.email,
                password = passwordHash,
                createdAt = now,
                updatedAt = now
            };

            // Add user 
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok();
        }


        // LOGIN USER
        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            // Trim string values 
            request.email = request.email.Trim().ToLower();
            request.password = request.password.Trim();

            // Check if email is correct
            string message = "Invalid email or password.";
            var user = _context.Users.Where(x => x.email == request.email).FirstOrDefault();
            
            if (user == null)
            {
                return BadRequest(new { message });
            }

            // Check if password is correct
            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.password, user.password);
            if (!isPasswordCorrect)
            {
                return BadRequest(new { message });
            }

            // Return user info 
            var userResponse = new
            {
                user.userId,
                user.email,
                FullName = $"{user.firstName} {user.lastName}".Trim()
            };
            string accessToken = CreateToken(user);
            return Ok(new { userResponse, accessToken });
        }


        // CREATE JWT TOKEN
        private string CreateToken(User user)
        {
            string? secret = _configuration.GetValue<string>("Authentication:Secret");
            if (string.IsNullOrEmpty(secret))
            {
                throw new Exception("Secret is required for JWT authentication.");
            }
            int tokenExpiresDays = _configuration.GetValue<int>("Authentication:TokenExpiresDays");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, user.userId.ToString()),
                    new Claim(ClaimTypes.Name, $"{user.firstName} {user.lastName}".Trim()),
                    new Claim(ClaimTypes.Email, user.email)
                ]),
                Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);

            return token;
        }

        // AUTHENTICATE USER
        [HttpGet("auth"), Authorize]
        public IActionResult Auth()
        {
            var id = Convert.ToInt32(User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).Select(c => c.Value).SingleOrDefault());
            var name = User.Claims.Where(c => c.Type == ClaimTypes.Name).Select(c => c.Value).SingleOrDefault();
            var email = User.Claims.Where(c => c.Type == ClaimTypes.Email).Select(c => c.Value).SingleOrDefault();

            if (id != 0 && name != null && email != null)
            {
                var user = new
                {
                    id,
                    email,
                    name
                };
                return Ok(new { user });
            }
            else
            {
                return Unauthorized();
            }
        }
    }
}
