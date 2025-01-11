﻿using Ecoture;
using EcotureAPI.Models.DataTransferObjects;
using EcotureAPI.Models.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Models.Entity;
using Models.Request;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace EcotureAPI.Services
{
    public class UserManager : IUserManager
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;


        public UserManager(MyDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
                    new Claim(ClaimTypes.Email, user.Email)
                ]),
                Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);

            return token;
        }

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
                UpdatedAt = now
            };

            // Add user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return (true, null);
        }

        public async Task<LoginResponse> LoginUserAsync(LoginRequest request)
        {
            // Trim string values
            request.email = request.email.Trim().ToLower();
            request.password = request.password.Trim();

            // Check if email is correct
            var user = _context.Users.FirstOrDefault(x => x.Email == request.email);
            if (user == null)
            {
                throw new ArgumentException("Invalid email or password.");
            }

            // Check if password is correct
            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.password, user.Password);
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
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new UnauthorizedAccessException("Your account has been permanently deleted.");
                }
            }

            // Generate access token
            string accessToken = CreateToken(user);

            // Return user info and access token
            var response = new LoginResponse
            {
                User = user,
                AccessToken = accessToken
            };

            return response;
        }

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


    }

    public interface IUserManager
    {
        Task<(bool IsSuccess, string ErrorMessage)> RegisterUserAsync(RegisterRequest request);
        Task<LoginResponse> LoginUserAsync(LoginRequest request);
        Task<User?> FindByEmailAsync(string email);
        Task<UserToken> GeneratePasswordResetTokenAsync(int userId);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    }
}
