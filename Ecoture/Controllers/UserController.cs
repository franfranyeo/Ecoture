﻿using Microsoft.AspNetCore.Mvc;
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
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        var now = DateTime.UtcNow;
                        // Create a new user
                        user = new User
                        {
                            Email = userInfo.Email,
                            FirstName = userInfo.GivenName ?? string.Empty,
                            LastName = userInfo.FamilyName ?? string.Empty,
                            Password = string.Empty, // No password for Google login
                            PfpURL = userInfo.Picture,
                            CreatedAt = now,
                            UpdatedAt = now,
                            IsGoogleLogin = true,
                            ReferralCode = RandomReferralCode.Generate(),
                            MembershipId = 1, // Set default membership
                        };

                        // Add user first to get UserId
                        await _context.Users.AddAsync(user);
                        await _context.SaveChangesAsync();

                        // Handle referral if provided
                        if (!string.IsNullOrEmpty(request.ReferralCode))
                        {
                            var referrer = await _context.Users
                                .FirstOrDefaultAsync(u => u.ReferralCode == request.ReferralCode);

                            if (referrer != null)
                            {
                                // Create referral record
                                var referral = new Referral
                                {
                                    referrerUserId = referrer.UserId,
                                    refereeUserId = user.UserId,
                                    referralDate = now
                                };
                                await _context.Referrals.AddAsync(referral);
                                await _context.SaveChangesAsync();

                                // Add points transaction for referrer
                                var referrerPoints = new PointsTransaction
                                {
                                    UserId = referrer.UserId,
                                    PointsEarned = 100, // Referral bonus points
                                    PointsSpent = 0,
                                    TransactionType = "Referral",
                                    CreatedAt = now,
                                    ExpiryDate = now.AddYears(1),
                                    ReferralId = referral.referralId
                                };
                                await _context.PointsTransactions.AddAsync(referrerPoints);

                                // Update referrer's total points
                                referrer.TotalPoints += referrerPoints.PointsEarned;
                                _context.Users.Update(referrer);
                            }
                        }

                        // Create MFA response
                        mfaMethods = new MfaResponse
                        {
                            UserId = user.UserId,
                        };
                        await _context.MfaResponses.AddAsync(mfaMethods);

                        // Add welcome points
                        var welcomePoints = new PointsTransaction
                        {
                            UserId = user.UserId,
                            PointsEarned = 500, // Welcome bonus points
                            PointsSpent = 0,
                            TransactionType = "Welcome",
                            CreatedAt = now,
                            ExpiryDate = now.AddYears(1)
                        };
                        await _context.PointsTransactions.AddAsync(welcomePoints);
                        user.TotalPoints += welcomePoints.PointsEarned;

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch (Exception)
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
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

                user.LastLogin = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Step 4: Prepare the response
                var res = new LoginResponse
                {
                    User = new UserDTO
                    {
                        UserId = user.UserId,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        FullName = user.FullName,
                        Email = user.Email,
                        MobileNo = user.MobileNo,
                        DateofBirth = user.DateofBirth,
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
                        LastClaimTime = user.LastClaimTime,
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

        [Authorize(Roles = "Admin")]
        [HttpPost("staff")]
        public async Task<IActionResult> CreateStaffAsync(CreateStaffRequest request)
        {
            // Trim input values
            request.FirstName = request.FirstName.Trim();
            request.LastName = request.LastName.Trim();
            request.Email = request.Email.Trim().ToLower();

            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { IsSuccess = false, ErrorMessage = "Email already exists." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Generate a secure random password
                var generatedPassword = GenerateSecurePassword(); // You'll need to implement this
                var now = DateTime.UtcNow;

                // Create user object with staff role
                var user = new User
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(generatedPassword),
                    Role = UserRole.Staff,
                    CreatedAt = now,
                    UpdatedAt = now,
                    MembershipId = 4 // Default membership
                };

                // Create MFA response record
                var mfaResponse = new MfaResponse
                {
                    UserId = user.UserId
                };

                // Add records to database
                await _context.Users.AddAsync(user);
                await _context.MfaResponses.AddAsync(mfaResponse);
                await _context.SaveChangesAsync();

                // Send password via email
                await _emailService.SendAsync(
                    request.Email,
                    "Ecoture: Staff Account Created",
                    $"Your temporary password is {generatedPassword}. Please change it upon your first login."
                );

                await transaction.CommitAsync();

                return Ok(new { IsSuccess = true });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { IsSuccess = false, ErrorMessage = "Failed to create staff account." });
            }
        }

        private string GenerateSecurePassword()
        {
            const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lowercase = "abcdefghijklmnopqrstuvwxyz";
            const string numbers = "0123456789";
            const string symbols = "#?!@$%^&*-";
            const int length = 12;

            var random = new Random();
            var password = new StringBuilder();

            // Ensure at least one of each required character type
            password.Append(uppercase[random.Next(uppercase.Length)]);
            password.Append(lowercase[random.Next(lowercase.Length)]);
            password.Append(numbers[random.Next(numbers.Length)]);
            password.Append(symbols[random.Next(symbols.Length)]);

            // Fill the rest with random characters
            var allChars = uppercase + lowercase + numbers + symbols;
            for (int i = password.Length; i < length; i++)
            {
                password.Append(allChars[random.Next(allChars.Length)]);
            }

            // Shuffle the password
            return new string(password.ToString().ToCharArray().OrderBy(x => random.Next()).ToArray());
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
            var resetUrl = $"http://localhost:3000/reset-password?token={resetToken.Token}";

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

        // RESET PASSWORD
        [HttpPost("reset-user-password")]
        public async Task<IActionResult> ResetUserPassword([FromBody] ResetUserPasswordRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            var generatedPassword = GenerateSecurePassword();
            user.Password = BCrypt.Net.BCrypt.HashPassword(generatedPassword);

            await _context.SaveChangesAsync();

            await _emailService.SendAsync(
                user.Email,
                "Ecoture: Password Reset",
                $"Your temporary password is {generatedPassword}. Please change it upon your first login."
            );

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

            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            if (User.IsInRole("Admin") || User.IsInRole("Staff"))
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
                    DateofBirth = u.DateofBirth,
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
                    LastLogin = u.LastLogin,
                    LastClaimTime = u.LastClaimTime,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                }).ToList();

                return Ok(users);
            }
            else
            {
                return Unauthorized(new { message = "You are not authorized to view this data." });
            }
        }

        [HttpGet("profile"), Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
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

            var userInfo = new UserDTO
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Email = user.Email,
                MobileNo = user.MobileNo,
                DateofBirth = user.DateofBirth,
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
                LastLogin = user.LastLogin,
                LastClaimTime = user.LastClaimTime,
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
                DateofBirth = rawUser.DateofBirth,
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
                LastLogin = rawUser.LastLogin,
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

        [HttpPost("sendemail")]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailRequest request)
        {
            try
            {
                await _emailService.SendAsync(request.To, request.Subject, request.Body);
                return Ok(new { message = "Email sent successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

            if (user.TotalSpending >= 2000)
            {
                user.MembershipId = 2;
            }
            else if (user.TotalPoints >= 4000)
            {
                user.MembershipId = 3;
            }

            var transaction = new PointsTransaction
            {
                UserId = user.UserId,
                PointsEarned = request.Points,
                PointsSpent = 0,
                TransactionType = "Spending",
                CreatedAt = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddYears(1)
            };

            await _context.PointsTransactions.AddAsync(transaction);

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
