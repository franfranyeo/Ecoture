using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using EcotureAPI.Models.Enum;
using EcotureAPI.Models.Request;
using EcotureAPI.Models.Entity;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using EcotureAPI.Services;
using EcotureAPI.Models.Response;


namespace EcotureAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController(MyDbContext context, IConfiguration configuration, IUserManager userManager, IEmailService emailService) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        private readonly IConfiguration _configuration = configuration;
        private readonly IUserManager _userManager = userManager;
        private readonly IEmailService _emailService = emailService;


        // REGISTER USER
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            // Register user via UserManager
            var result = await _userManager.RegisterUserAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "User registered successfully." });
        }


        // LOGIN USER
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                var response = await _userManager.LoginUserAsync(request);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // GOOGLE SIGNIN
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin(GoogleLoginRequest request)
        {
            System.Diagnostics.Debug.WriteLine(request.Token);
            try
            {
                using var httpClient = new HttpClient();
                var url = $"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.Token}";
                var response = await httpClient.GetAsync(url);

                string content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return Unauthorized(new { message = "Invalid Google token" });
                }


                var userInfo = await response.Content.ReadFromJsonAsync<GoogleUserInfo>();
                // Check if the user exists in your database
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userInfo.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = userInfo.Email,
                        FirstName = string.IsNullOrEmpty(userInfo.GivenName) ? "" : userInfo.GivenName,
                        LastName = string.IsNullOrEmpty(userInfo.FamilyName) ? "" : userInfo.FamilyName,
                        Password = string.Empty,
                        PfpURL = userInfo.Picture,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                    };

                    var mfaResponse = new MfaResponse
                    {
                        UserId = user.UserId
                    };
                    // Add user 
                    await _context.Users.AddAsync(user);
                    await _context.MfaResponses.AddAsync(mfaResponse);
                    await _context.SaveChangesAsync();
                }

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
                        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
                    new Claim(ClaimTypes.Email, user.Email)
                    ]),
                    Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var securityToken = tokenHandler.CreateToken(tokenDescriptor);
                string token = tokenHandler.WriteToken(securityToken);

                return Ok(new
                {
                    token,
                    user
                });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new { message = "Invalid Google token" });
            }
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

        // CREATE STAFF WITH ADMIN ROLE
        [HttpPost("create-staff"), Authorize]
        public async Task<IActionResult> CreateStaff(CreateStaffRequest request)
        {
            // Check if user is an admin
            var id = Convert.ToInt32(User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).Select(c => c.Value).SingleOrDefault());
            var user = _context.Users.Find(id);

            if (user.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            // trim string values
            request.FirstName = request.FirstName.Trim();
            request.LastName = request.LastName.Trim();
            request.Email = request.Email.Trim();
            request.Password = request.Password.Trim();
            
            // Check if user already exists
            var userExists = _context.Users.Any(u => u.Email == request.Email);
            if (userExists)
            {
                string message = "Email already exists.";
                return BadRequest(new { message });
            }
            // Create user object 
            var now = DateTime.Now;
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var staff = new User()
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Password = passwordHash,
                Role = UserRole.Staff,
                CreatedAt = now,
                UpdatedAt = now
            };
            // Add user 
            _context.Users.Add(staff);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // GET MFA
        [HttpPost("get-mfa")]
        public async Task<ActionResult<MfaResponse>> GetMfaResponse([FromBody] MfaRequest request)
        {
            var userId = request.UserId;
            var mfaResponse = await _context.MfaResponses
                                            .FirstOrDefaultAsync(u => u.UserId == userId);

            if (mfaResponse == null)
            {
                return NotFound(new { message = $"User with ID '{userId}' not found." });
            }

            return Ok(mfaResponse);
        }

        // UPDATE MFA
        [HttpPost("update-mfa"), Authorize]
        public async Task<ActionResult> UpdateMfa([FromBody] UpdateMfaRequest request)
        {
            // Retrieve the user's current MFA response from the database
            var mfaResponse = await _context.MfaResponses.FirstOrDefaultAsync(m => m.UserId == request.UserId);
            if (mfaResponse == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // List of valid MFA types
            var validMfaTypes = new List<string> { "sms", "email", "authenticator" };

            // Process each MFA type in the request
            foreach (var mfaType in request.MfaTypes)
            {
                if (!validMfaTypes.Contains(mfaType.ToLower()))
                {
                    return BadRequest(new { message = $"Invalid MFA type: {mfaType}" });
                }

                switch (mfaType.ToLower())
                {
                    case "sms":
                        mfaResponse.Sms = request.Enable;
                        break;
                    case "email":
                        mfaResponse.Email = request.Enable;
                        break;
                    case "authenticator":
                        mfaResponse.Authenticator = request.Enable;
                        break;
                }
            }

            // Save changes to the database
            await _context.SaveChangesAsync();
            return Ok(new { message = "MFA settings updated successfully." });
        }


        // EDIT PROFILE
        [HttpPost("edit-profile")]
        [Authorize]
        public async Task<IActionResult> EditProfile([FromBody] EditProfileRequest request)
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (userId <= 0) return Unauthorized();

            var result = await _userManager.EditProfileAsync(userId, request);
            if (!result.IsSuccess)
            {
                return BadRequest(new { message = result.ErrorMessage });
            }

            // Return the updated user data without sensitive information
            return Ok(new
            {
                message = "Profile updated successfully.",
                user = new
                {
                    result.UpdatedUser.UserId,
                    result.UpdatedUser.FirstName,
                    result.UpdatedUser.LastName,
                    result.UpdatedUser.Email,
                    result.UpdatedUser.MobileNo,
                    result.UpdatedUser.DateofBirth,
                    result.UpdatedUser.PfpURL,
                    result.UpdatedUser.Is2FAEnabled,
                    result.UpdatedUser.IsEmailVerified,
                    result.UpdatedUser.IsPhoneVerified,
                    result.UpdatedUser.UpdatedAt
                }
            });
        }


        // CHANGE PASSWORD
        [HttpPost("change-password"), Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (userId <= 0) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(userId, request);
            if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });

            return Ok(new { message = "Password changed successfully." });
        }




        // FORGOT PASSWORD
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Do not reveal if the user does not exist for security reasons
                return Ok("If an account with this email exists, a password reset email has been sent.");
            }

            // Generate a password reset token
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user.UserId);

            // Create password reset URL (you can add token expiration here)
            var resetUrl = $"{_configuration["AppSettings:FrontendUrl"]}/reset-password?token={resetToken.Token}";

            // Send the password reset email (e.g., using SendGrid)
            await _emailService.SendAsync(user.Email, "Password Reset Request", $"Click the link to reset your password: {resetUrl}");

            return Ok("If an account with this email exists, a password reset email has been sent.");
        }

        // RESET PASSWORD
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            // Find user by email (token doesn't store email, so it must be passed explicitly)
            // look for user by token
            var userToken = await _context.UserTokens.FirstOrDefaultAsync(t => t.Token == request.Token && t.TokenType == "PasswordReset");
            if (userToken == null)
            {
                return BadRequest(new { message = "Invalid token" });
            }

            var user = await _context.Users.FindAsync(userToken.UserId);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            // Reset the password using the token
            var result = await _userManager.ResetPasswordAsync(user.Email, request.Token, request.NewPassword);
            if (!result)
                return BadRequest(new { message = "Invalid token or password reset failed" });

            return Ok(new { message = "Password reset successful" });
        }



        // CUSTOMER DELETE ACCOUNT (2 STEPS)
        // Step 1: Request account deletion
        [HttpPost("{id}/delete-request"), Authorize]
        public async Task<IActionResult> RequestDeletion(int id)
        {
            var result = await _userManager.RequestAccountDeletionAsync(id, User);
            if (!result.IsSuccess)
            {
                return StatusCode(result.StatusCode, new { message = result.Message });
            }
            return Ok(new { message = result.Message });
        }


        // Step 2: Permenant account deletion
        [HttpPost("{id}/permanent-delete"), Authorize]
        public async Task<IActionResult> PermanentDelete(int id)
        {
            var result = await _userManager.PermanentlyDeleteAccountAsync(id, User);
            if (!result.IsSuccess)
            {
                return StatusCode(result.StatusCode, new { message = result.Message });
            }
            return Ok(new { message = result.Message });
        }


        // ADMIN STAFF DELETE ACCOUNT (permenant delete) 
        // Note: Admin can delete staff and customer accounts ; Staff can only delete customer accounts

        [HttpDelete("{id}/hard-delete"), Authorize]
        public async Task<IActionResult> HardDelete(int id)
        {
            // Get logged-in user's role
            var loggedInUserRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            // Find the target user
            var userToDelete = await _context.Users.FindAsync(id);
            if (userToDelete == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (loggedInUserRole == UserRole.Staff.ToString() && userToDelete.Role != UserRole.Customer)
            {
                return Unauthorized(new { message = "Staff can only delete Customer accounts." });
            }

            if (loggedInUserRole != UserRole.Admin.ToString() && loggedInUserRole != UserRole.Staff.ToString())
            {
                return Unauthorized(new { message = "You are not authorised to delete this account." });
            }

            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User account deleted successfully." });
        }

        [HttpGet, Authorize]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        // GET: api/Users/5 (Get user by ID)
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // POST: api/Users (Create a new user)
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }

        // PUT /users/{UserId}
        [HttpPut("{UserId}")]
        public async Task<IActionResult> EditUser(EditUserRequest request, int UserId)
        {
            await _userManager.EditUserAsync(UserId, request.FirstName, request.LastName, request.Email, request.DateofBirth, request.Role, request.PfpURL);

            return Ok(new EditUserResponse
            {
                UserId = UserId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                DateofBirth = request.DateofBirth,
                Role = request.Role,
                PfpURL = request.PfpURL
            });
        }


        // DELETE: api/Users/5 (Delete a user)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
