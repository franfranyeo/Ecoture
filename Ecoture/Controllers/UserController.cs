using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Ecoture.Model.Enum;
using Ecoture.Model.Request;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Ecoture.Model.Entity;
using Ecoture.Services;
using Ecoture.Model.Response;
using Ecoture.Model.DTO;
using System.Globalization;


namespace Ecoture.Controllers
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
            var (IsSuccess, ErrorMessage) = await _userManager.RegisterUserAsync(request);
            if (!IsSuccess)
                return BadRequest(new { message = ErrorMessage });

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
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin(GoogleLoginRequest request)
        {
            try
            {
                // Step 1: Validate the Google token and fetch user info
                using var httpClient = new HttpClient();
                var url = $"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.Token}";
                var response = await httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return Unauthorized(new { message = "Invalid Google token" });
                }

                var userInfo = await response.Content.ReadFromJsonAsync<GoogleUserInfo>();
                if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
                {
                    return Unauthorized(new { message = "Invalid Google user information" });
                }

                // Step 2: Check if the user exists in the database
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userInfo.Email);
                MfaResponse? mfaMethods = null;
                Membership? membership = null;

                if (user == null)
                {
                    // Create a new user
                    user = new User
                    {
                        Email = userInfo.Email,
                        FirstName = userInfo.GivenName ?? string.Empty,
                        LastName = userInfo.FamilyName ?? string.Empty,
                        Password = string.Empty, // No password for Google login
                        PfpURL = userInfo.Picture,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsGoogleLogin = true,
                        ReferralCode = RandomReferralCode.Generate(),
                    };

                    mfaMethods = await _context.MfaResponses.FirstOrDefaultAsync(m => m.UserId == user.UserId);
                    mfaMethods ??= new MfaResponse
                    {
                        UserId = user.UserId,
                    };
                    // Add user and membership to the database
                    _context.Users.Add(user);
                    await _context.MfaResponses.AddAsync(mfaMethods);
                    await _context.SaveChangesAsync();
                }
                // Fetch existing membership and MFA methods
                membership = await _context.Memberships.FirstOrDefaultAsync(m => m.MembershipId == user.MembershipId);
                mfaMethods = await _context.MfaResponses.FirstOrDefaultAsync(m => m.UserId == user.UserId);
                mfaMethods ??= new MfaResponse
                {
                    UserId = user.UserId,
                };
                // Step 3: Generate JWT token
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
                    Subject = new ClaimsIdentity(new[]
                    {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
                    Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var securityToken = tokenHandler.CreateToken(tokenDescriptor);
                string token = tokenHandler.WriteToken(securityToken);

                // Step 4: Prepare the response
                var res = new LoginResponse
                {
                    User = new UserLoginDTO
                    {
                        UserId = user.UserId,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        FullName = user.FullName,
                        Email = user.Email,
                        MobileNo = user.MobileNo,
                        DateOfBirth = user.DateofBirth,
                        Role = user.Role.ToString(),
                        PfpURL = user.PfpURL,
                        TotalSpending = user.TotalSpending,
                        TotalPoints = user.TotalPoints,
                        MembershipTier = membership?.Tier.ToString() ?? "Bronze",
                        MembershipStartDate = user.MembershipStartDate,
                        MembershipEndDate = user.MembershipEndDate,
                        ReferralCode = user.ReferralCode,
                        Is2FAEnabled = user.Is2FAEnabled,
                        IsEmailVerified = user.IsEmailVerified,
                        IsPhoneVerified = user.IsPhoneVerified,
                        IsGoogleLogin = user.IsGoogleLogin,
                        LastLogin = user.LastLogin,
                        CreatedAt = user.CreatedAt,
                        UpdatedAt = user.UpdatedAt,
                    },
                    AccessToken = token,
                    MfaMethods = mfaMethods,
                };

                return Ok(res);
            }
            catch (HttpRequestException)
            {
                return Unauthorized(new { message = "Invalid Google token" });
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.Error.WriteLine($"Error during Google login: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var validMfaTypes = new List<string> { "sms", "email" };

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

            var (IsSuccess, ErrorMessage, UpdatedUser) = await _userManager.EditProfileAsync(userId, request);
            if (!IsSuccess)
            {
                return BadRequest(new { message = ErrorMessage });
            }

            // Return the updated user data without sensitive information
            return Ok(new
            {
                message = "Profile updated successfully.",
                user = UpdatedUser
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

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            if (User.IsInRole("Admin"))
            {
                var rawUsers = await _context.Users
                .Include(u => u.Membership)
                .ToListAsync();

                // Proceed with the mapping logic
                var users = rawUsers.Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    FullName = u.FullName,
                    Email = u.Email,
                    MobileNo = u.MobileNo,
                    DateOfBirth = u.DateofBirth,
                    Role = u.Role.ToString(),
                    PfpURL = u.PfpURL,
                    TotalSpending = u.TotalSpending,
                    TotalPoints = u.TotalPoints,
                    MembershipTier = u.Membership.Tier.ToString(),
                    MembershipStartDate = u.MembershipStartDate,
                    MembershipEndDate = u.MembershipEndDate,
                    ReferralCode = u.ReferralCode,
                    Is2FAEnabled = u.Is2FAEnabled,
                    IsEmailVerified = u.IsEmailVerified,
                    IsPhoneVerified = u.IsPhoneVerified,
                    IsGoogleLogin = u.IsGoogleLogin,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                }).ToList();

                return Ok(users);
            }
            else
            {
                var user = await _context.Users
                        .Include(u => u.Membership) // Include Membership to avoid null reference
                        .FirstOrDefaultAsync(u => u.UserId == userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                var mfaDetails = await _context.MfaResponses
                .FirstOrDefaultAsync(m => m.UserId == user.UserId);
                // If no MFA record exists, create a new one with default values
                mfaDetails ??= new MfaResponse
                {
                    UserId = user.UserId,
                };

                var userInfo = new UserLoginDTO
                {
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    Email = user.Email,
                    MobileNo = user.MobileNo,
                    DateOfBirth = user.DateofBirth,
                    Role = user.Role.ToString(),
                    PfpURL = user.PfpURL,
                    TotalSpending = user.TotalSpending,
                    TotalPoints = user.TotalPoints,
                    MembershipTier = user.Membership.Tier.ToString(),
                    MembershipStartDate = user.MembershipStartDate,
                    MembershipEndDate = user.MembershipEndDate,
                    ReferralCode = user.ReferralCode,
                    Is2FAEnabled = user.Is2FAEnabled,
                    IsEmailVerified = user.IsEmailVerified,
                    IsPhoneVerified = user.IsPhoneVerified,
                    IsGoogleLogin = user.IsGoogleLogin,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                var userResponse = new
                {
                    User = userInfo,
                    MfaMethods = mfaDetails
                };
                return Ok(userResponse);
            }
        }
        // GET: api/Users/5 (Get user by ID)
        [HttpGet("{userId}"), Authorize]
        public async Task<IActionResult> GetUser(int userId)
        {
            var rawUser = await _context.Users
                .Include(u => u.Membership)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (rawUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Proceed with the mapping logic
            var user = new UserDTO
            {
                UserId = rawUser.UserId,
                FirstName = rawUser.FirstName,
                LastName = rawUser.LastName,
                FullName = rawUser.FullName,
                Email = rawUser.Email,
                MobileNo = rawUser.MobileNo,
                DateOfBirth = rawUser.DateofBirth,
                Role = rawUser.Role.ToString(),
                PfpURL = rawUser.PfpURL,
                TotalSpending = rawUser.TotalSpending,
                TotalPoints = rawUser.TotalPoints,
                MembershipTier = rawUser.Membership.Tier.ToString(),
                MembershipStartDate = rawUser.MembershipStartDate,
                MembershipEndDate = rawUser.MembershipEndDate,
                ReferralCode = rawUser.ReferralCode,
                Is2FAEnabled = rawUser.Is2FAEnabled,
                IsEmailVerified = rawUser.IsEmailVerified,
                IsPhoneVerified = rawUser.IsPhoneVerified,
                IsGoogleLogin = rawUser.IsGoogleLogin,
                CreatedAt = rawUser.CreatedAt,
                UpdatedAt = rawUser.UpdatedAt
            };

            return Ok(user);
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

        [HttpPost("spending")]
        public async Task<IActionResult> UpdateSpending([FromBody] SpendingRequest request)
        {
            // Validate the request
            if (request == null || string.IsNullOrEmpty(request.Amount))
            {
                return BadRequest("Amount is required.");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in claims.");
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (!decimal.TryParse(request.Amount, out decimal spending))
            {
                return BadRequest("Invalid amount format.");
            }

            if (request.RedemptionId.HasValue)
            {
                var redemption = await _context.UserRedemptions.FindAsync(request.RedemptionId.Value);
                if (redemption == null)
                {
                    return NotFound("Redemption not found.");
                }

                redemption.Status = RedemptionStatus.Used;
            }

            user.TotalSpending += spending;
            user.TotalPoints += request.Points;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Spending updated successfully." });
        }

        public class SpendingRequest
        {
            public string Amount { get; set; }
            public int Points { get; set; }

            public int? RedemptionId { get; set; }
        }
    }
}
