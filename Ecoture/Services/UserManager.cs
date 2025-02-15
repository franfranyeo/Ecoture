using Ecoture.Model.Enum;
using Ecoture.Model.DTO;
using Ecoture.Model.Entity;
using Ecoture.Model.Request;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Ecoture.Model.Response;


namespace Ecoture.Services
{
    public class UserManager(MyDbContext context, IConfiguration configuration) : IUserManager
    {
        private readonly MyDbContext _context = context;
        private readonly IConfiguration _configuration = configuration;

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
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                ]),
                Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);

            return token;
        }

        // REGISTER USER
        public async Task<(bool IsSuccess, string ErrorMessage)> RegisterUserAsync(RegisterRequest request)
        {
            // Trim input values
            request.FirstName = request.FirstName.Trim();
            request.LastName = request.LastName.Trim();
            request.Email = request.Email.Trim();
            request.Password = request.Password.Trim();

            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return (false, "Email already exists.");

            // Create user object and hash password
            var now = DateTime.UtcNow;
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = now,
                UpdatedAt = now,
            };

            user.MembershipId = 1;

            var mfaResponse = new MfaResponse
            {
                UserId = user.UserId
            };

            // Add user to the database
            await _context.Users.AddAsync(user);
            await _context.MfaResponses.AddAsync(mfaResponse);
            await _context.SaveChangesAsync();
            return (true, null);
        }

        // LOGIN USER
        public async Task<LoginResponse> LoginUserAsync(LoginRequest request)
        {
            // Trim string values
            request.Email = request.Email.Trim().ToLower();
            request.Password = request.Password.Trim();

            // Check if email is correct
            var user = _context.Users.FirstOrDefault(x => x.Email == request.Email);
            if (user == null)
            {
                throw new ArgumentException("Invalid email or password.");
            }

            // Check if password is correct
            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
            if (!isPasswordCorrect)
            {
                throw new ArgumentException("Invalid email or password.");
            }

            // Check if the account is soft-deleted
            if (user.DeleteRequested)
            {
                var gracePeriod = TimeSpan.FromDays(30);
                var timeSinceRequest = DateTime.UtcNow - user.DeleteRequestedAt;

                if (timeSinceRequest <= gracePeriod)
                {
                    // Reactivate account
                    user.DeleteRequested = false;
                    user.DeleteRequestedAt = null;
                }
                else
                {
                    throw new UnauthorizedAccessException("Your account has been permanently deleted.");
                }
            }

            user.LastLogin = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Generate access token
            string accessToken = CreateToken(user);

            // Get MFA details in the same database context
            var mfaDetails = await _context.MfaResponses
                .FirstOrDefaultAsync(m => m.UserId == user.UserId);
            // If no MFA record exists, create a new one with default values
            mfaDetails ??= new MfaResponse
            {
                UserId = user.UserId,
            };

            var membershipDetails = await _context.Memberships.FirstOrDefaultAsync(m => m.MembershipId == user.MembershipId);
            
            // Return user info and access token
            var response = new LoginResponse
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
                    MembershipTier = membershipDetails?.Tier.ToString() ?? "Bronze",
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
                AccessToken = accessToken,
                MfaMethods = mfaDetails,
            };

            return response;
        }

        // FIND USER BY EMAIL
        public async Task<User?> FindByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<UserToken> GeneratePasswordResetTokenAsync(int userId)
        {
            var token = Guid.NewGuid().ToString();  // Create a new GUID token string
            var expirationDate = DateTime.UtcNow.AddHours(1);  // Set expiration to 1 hour from now

            // Create the UserToken object
            var userToken = new UserToken
            {
                UserId = userId,
                Token = token,
                TokenType = "PasswordReset",  // Token type for password reset
                ExpirationDate = expirationDate,
                CreatedAt = DateTime.UtcNow,
                IsUsed = false
            };

            // Add the UserToken to the database
            _context.UserTokens.Add(userToken);
            await _context.SaveChangesAsync();

            return userToken;
        }


        // RESET PASSWORD
        public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var userToken = await _context.UserTokens
                .FirstOrDefaultAsync(t => t.Token == token && t.ExpirationDate > DateTime.UtcNow);

            if (userToken == null)
                return false;

            var user = await _context.Users.FindAsync(userToken.UserId);
            if (user == null)
                return false;

            // Hash the new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            _context.UserTokens.Remove(userToken); // Remove used token
            await _context.SaveChangesAsync();

            return true;
        }

        // GENERATE OTP
        public async Task GenerateOtpAsync(int userId, string otpType)
        {
            var otp = new Random().Next(100000, 999999).ToString(); // Generate 6-digit OTP
            var expiresAt = DateTime.UtcNow.AddMinutes(5); // Set expiration time

            var existingOtp = await _context.UserOTPs.FirstOrDefaultAsync(u => u.UserId == userId);

            if (existingOtp != null)
            {
                existingOtp.Otp = otp;
                existingOtp.OtpType = otpType;
                existingOtp.ExpirationDate = expiresAt;
                existingOtp.IsVerified = false;
                existingOtp.CreatedAt = DateTime.UtcNow;
            }
            else
            {
                var newOtp = new UserOtp
                {
                    UserId = userId,
                    Otp = otp,
                    OtpType = otpType,
                    ExpirationDate = expiresAt,
                    IsVerified = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.UserOTPs.AddAsync(newOtp);
            }

            await _context.SaveChangesAsync();
        }

        // VERIFY OTP
        public async Task<bool> VerifyOtpAsync(int userId, string otp)
        {
            var userOtp = await _context.UserOTPs.FirstOrDefaultAsync(u => u.UserId == userId);

            if (userOtp == null || userOtp.ExpirationDate < DateTime.UtcNow || userOtp.IsVerified)
            {
                return false; // OTP not found, expired, or already verified
            }

            if (userOtp.Otp == otp)
            {
                userOtp.IsVerified = true;
                await _context.SaveChangesAsync();
                return true; // OTP successfully verified
            }

            return false; // Invalid OTP
        }


        // CUSTOMER DELETE ACCOUNT 
        // Step 1: Request account deletion
        public async Task<(bool IsSuccess, int StatusCode, string Message)> RequestAccountDeletionAsync(int userId, ClaimsPrincipal userPrincipal)
        {
            // Get logged-in user's ID and role
            var loggedInUserId = Convert.ToInt32(userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var loggedInUserRole = userPrincipal.FindFirst(ClaimTypes.Role)?.Value;

            // Find the target user
            var userToDelete = await _context.Users.FindAsync(userId);
            if (userToDelete == null)
            {
                return (false, 404, "User not found.");
            }

            // Customers can only request deletion for their own accounts
            if (loggedInUserRole == UserRole.Customer.ToString() && loggedInUserId != userId)
            {
                return (false, 401, "You can only delete your own account.");
            }

            // If deletion is already requested, return an error
            if (userToDelete.DeleteRequested)
            {
                return (false, 400, "Account deletion already requested.");
            }

            // Mark account as deletion requested
            userToDelete.DeleteRequested = true;
            userToDelete.DeleteRequestedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return (true, 200, "Account deletion requested.");
        }

        public async Task<(bool IsSuccess, int StatusCode, string Message)> PermanentlyDeleteAccountAsync(int userId, ClaimsPrincipal userPrincipal)
        {
            // Get logged-in user's role
            var loggedInUserRole = userPrincipal.FindFirst(ClaimTypes.Role)?.Value;

            var userToDelete = await _context.Users.FindAsync(userId);
            if (userToDelete == null)
            {
                return (false, 404, "User not found.");
            }

            // Only Admins can perform permanent deletion
            if (loggedInUserRole != UserRole.Admin.ToString())
            {
                return (false, 401, "You are not authorised to permanently delete this account.");
            }

            // Ensure deletion request exists and grace period has expired

            if (!userToDelete.DeleteRequested || !userToDelete.DeleteRequestedAt.HasValue)
            {
                return (false, 400, "Deletion request not made.");
            }

            var deletionRequestTime = userToDelete.DeleteRequestedAt.Value;
            if ((DateTime.UtcNow - deletionRequestTime).TotalDays < 30)
            {
                return (false, 400, "You must wait 30 days before permanent deletion.");
            }

            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();

            return (true, 200, "User account permanently deleted.");
        }


        // EDIT USER PROFILE
        public async Task<(bool IsSuccess, string? ErrorMessage, ProfileResponse? UpdatedUser)> EditProfileAsync(int userId, EditProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return (false, "User not found.", null);

            try
            {
                // Handle email update
                if (request.Email != null)
                {
                    var email = request.Email.Trim().ToLower();
                    if (user.Email != email)
                    {
                        var emailExists = await _context.Users
                            .AnyAsync(u => u.Email == email && u.UserId != userId);
                        if (emailExists) return (false, "Email is already taken.", null);
                        user.Email = email;
                    }
                }

                // Handle phone number update
                if (request.MobileNo != null)
                {
                    var phoneNumber = request.MobileNo.Trim();
                    if (!string.IsNullOrEmpty(phoneNumber))
                    {
                        if (!phoneNumber.StartsWith("+65 ") || phoneNumber.Length != 13)
                        {
                            return (false, "Invalid phone number format. Must start with '+65 ' and be 8 digits.", null);
                        }
                        user.MobileNo = phoneNumber;
                    }
                }

                // Handle basic profile updates
                if (request.FirstName != null)
                {
                    user.FirstName = request.FirstName.Trim();
                }

                if (request.LastName != null)
                {
                    user.LastName = request.LastName.Trim();
                }

                user.DateofBirth = request.DateofBirth;

                if (request.PfpURL != null)
                {
                    user.PfpURL = request.PfpURL;
                }

                // Handle 2FA related updates
                if (request.Is2FAEnabled.HasValue)
                {
                    user.Is2FAEnabled = request.Is2FAEnabled.Value;
                }

                if (request.IsEmailVerified.HasValue)
                {
                    user.IsEmailVerified = request.IsEmailVerified.Value;
                }

                if (request.IsPhoneVerified.HasValue)
                {
                    user.IsPhoneVerified = request.IsPhoneVerified.Value;
                }

                // Update MFA methods if provided
                if (request.MFAMethods != null)
                {
                    await UpdateUserMFAMethodsAsync(userId, request.MFAMethods);
                }

                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Fetch updated MFA data
                var mfaMethods = await _context.MfaResponses
                    .FirstOrDefaultAsync(m => m.UserId == userId) ?? new MfaResponse
                    {
                        UserId = userId,
                        Sms = false,
                        Email = false,
                    };

                // Create response object with both user and MFA data
                var profileResponse = new ProfileResponse
                {
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    MobileNo = user.MobileNo,
                    DateofBirth = user.DateofBirth,
                    PfpURL = user.PfpURL,
                    Is2FAEnabled = user.Is2FAEnabled,
                    IsEmailVerified = user.IsEmailVerified,
                    IsPhoneVerified = user.IsPhoneVerified,
                    UpdatedAt = user.UpdatedAt,
                    MfaMethods = mfaMethods
                };

                return (true, null, profileResponse);
            }
            catch (Exception ex)
            {
                // Log the exception
                return (false, "An error occurred while updating the profile.", null);
            }
        }


        // CHNAGE PASSWORD
        public async Task<(bool IsSuccess, string? ErrorMessage)> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return (false, "User not found.");

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
                return (false, "Current password is incorrect.");

            // Hash and update new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return (true, null);
        }


        private async Task UpdateUserMFAMethodsAsync(int userId, MfaResponse methods)
        {
            // Get existing MFA response for the user
            var mfaResponse = await _context.MfaResponses
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (mfaResponse == null)
            {
                // If no MFA response exists, create a new one
                mfaResponse = new MfaResponse
                {
                    UserId = userId
                };
                _context.MfaResponses.Add(mfaResponse);
            }

            // Reset all methods to false
            mfaResponse.Email = methods.Email;
            mfaResponse.Sms = methods.Sms;

            await _context.SaveChangesAsync();
        }

        public async Task EditUserAsync(int userId, string firstName, string lastName, string email, DateTime? dateOfBirth, string role, string pfpUrl)
        {
            var r = Enum.Parse<UserRole>(role);
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.FirstName = firstName;
                user.LastName = lastName;
                user.Email = email;
                user.DateofBirth = dateOfBirth;
                user.Role = r;
                user.PfpURL = pfpUrl;

                await _context.SaveChangesAsync();
            }
        }
    }

    public interface IUserManager
    {
        Task<(bool IsSuccess, string ErrorMessage)> RegisterUserAsync(RegisterRequest request);
        Task<LoginResponse> LoginUserAsync(LoginRequest request);
        Task<User?> FindByEmailAsync(string email);
        Task<UserToken> GeneratePasswordResetTokenAsync(int userId);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
        Task GenerateOtpAsync(int userId, string otpType);
        Task<bool> VerifyOtpAsync(int userId, string otp);
        Task<(bool IsSuccess, int StatusCode, string Message)> RequestAccountDeletionAsync(int userId, ClaimsPrincipal userPrincipal);
        Task<(bool IsSuccess, int StatusCode, string Message)> PermanentlyDeleteAccountAsync(int userId, ClaimsPrincipal userPrincipal);
        Task<(bool IsSuccess, string? ErrorMessage, ProfileResponse? UpdatedUser)> EditProfileAsync(int userId, EditProfileRequest request);
        Task<(bool IsSuccess, string? ErrorMessage)> ChangePasswordAsync(int userId, ChangePasswordRequest request);

        Task EditUserAsync(int userId, string firstName, string lastName, string email, DateTime? dateOfBirth, string role, string pfpUrl);
    }

}