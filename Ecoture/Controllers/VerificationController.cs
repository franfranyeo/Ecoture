using Ecoture;
using Ecoture.Model.Entity;
using Ecoture.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Ecoture.Controllers
{
    [Route("verify")]
    [ApiController]
    public class VerificationController(IEmailService emailService, IConfiguration configuration, ISmsService smsService, MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        private readonly IEmailService _emailService = emailService;
        private readonly ISmsService _smsService = smsService;
        private readonly IConfiguration _configuration = configuration;

        [HttpPost("email")]
        public async Task<IActionResult> SendVerificationEmail([FromBody] EmailVerificationRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Email is required.");
            }

            // Generate OTP (for simplicity, using a random 6-digit OTP)
            var otp = new Random().Next(100000, 999999).ToString();

            // Find or create the user in your database (based on email or user identifier)
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            // Create a new OTP entry
            var userOtp = new UserOtp
            {
                UserId = user.UserId,
                Otp = otp,
                OtpType = "email",
                ExpirationDate = DateTime.UtcNow.AddMinutes(5), // OTP expires in 5 minutes
                CreatedAt = DateTime.UtcNow,
                IsVerified = false
            };

            _context.UserOTPs.Add(userOtp);
            await _context.SaveChangesAsync();

            // Send the OTP via email
            await _emailService.SendAsync(request.Email, "Ecoture: Verify email address", $"Your OTP is {otp}. It expires in 5 minutes.");

            return Ok("Verification email sent.");
        }

        // Verify the OTP entered by the user
        [HttpPost("email-otp")]
        public async Task<IActionResult> VerifyEmail([FromBody] OtpVerificationRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp))
            {
                return BadRequest("Email and OTP are required.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            // Find the OTP in the database
            var userOtp = await _context.UserOTPs
                                        .Where(uo => uo.UserId == user.UserId)
                                        .OrderByDescending(uo => uo.CreatedAt) // Get the latest OTP
                                        .FirstOrDefaultAsync();

            if (userOtp == null)
            {
                return BadRequest("No OTP found.");
            }

            // Check if OTP has expired
            if (userOtp.ExpirationDate < DateTime.UtcNow)
            {
                return BadRequest("OTP has expired.");
            }

            // Check if OTP matches and is not verified
            if (userOtp.Otp == request.Otp && !userOtp.IsVerified)
            {
                userOtp.IsVerified = true;
                _context.UserOTPs.Update(userOtp);

                // Optionally, mark email as verified for the user
                var userToUpdate = await _context.Users.FindAsync(user.UserId);
                if (userToUpdate == null)
                {
                    return BadRequest("User not found.");
                }

                userToUpdate.IsEmailVerified = true;
                _context.Users.Update(userToUpdate);

                await _context.SaveChangesAsync();

                return Ok("Email verified successfully.");
            }

            return BadRequest("Invalid OTP.");
        }

        [HttpPost("phone")]
        public async Task<IActionResult> SendVerificationPhone([FromBody] SmsVerificationRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Email is required.");
            } else if (string.IsNullOrEmpty(request.PhoneNo))
            {
                return BadRequest("Phone number is required.");
            }

            // Generate OTP (for simplicity, using a random 6-digit OTP)
            var otp = new Random().Next(100000, 999999).ToString();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            // Create a new OTP entry
            var userOtp = new UserOtp
            {
                UserId = user.UserId,
                Otp = otp,
                OtpType = "phone",
                ExpirationDate = DateTime.UtcNow.AddMinutes(5), // OTP expires in 5 minutes
                CreatedAt = DateTime.UtcNow,
                IsVerified = false
            };

            _context.UserOTPs.Add(userOtp);
            await _context.SaveChangesAsync();

            // Send the OTP via email
            _smsService.SendOtp(request.PhoneNo, otp);

            return Ok("OTP has been sent to your phone.");
        }

        // Verify the OTP entered by the user
        [HttpPost("phone-otp")]
        public async Task<IActionResult> VerifyPhone([FromBody] OtpVerificationRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp))
            {
                return BadRequest("Email and OTP are required.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            // Find the OTP in the database
            var userOtp = await _context.UserOTPs
                                        .Where(uo => uo.UserId == user.UserId)
                                        .OrderByDescending(uo => uo.CreatedAt) // Get the latest OTP
                                        .FirstOrDefaultAsync();

            if (userOtp == null)
            {
                return BadRequest("No OTP found.");
            }

            // Check if OTP has expired
            if (userOtp.ExpirationDate < DateTime.UtcNow)
            {
                return BadRequest("OTP has expired.");
            }

            // Check if OTP matches and is not verified
            if (userOtp.Otp == request.Otp && !userOtp.IsVerified)
            {
                userOtp.IsVerified = true;
                _context.UserOTPs.Update(userOtp);

                // Optionally, mark email as verified for the user
                var userToUpdate = await _context.Users.FindAsync(user.UserId);
                if (userToUpdate == null)
                {
                    return BadRequest("User not found.");
                }

                userToUpdate.IsEmailVerified = true;
                _context.Users.Update(userToUpdate);

                await _context.SaveChangesAsync();

                return Ok("Phone number verified successfully.");
            }

            return BadRequest("Invalid OTP.");
        }

        [HttpPost("change-email")]
        public async Task<IActionResult> InitiateEmailChange([FromBody] EmailChangeRequest request)
        {
            if (string.IsNullOrEmpty(request.NewEmail))
            {
                return BadRequest("New email is required.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == request.UserId);

            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.NewEmail && u.UserId != request.UserId);

            if (emailExists)
            {
                return BadRequest("Email is already in use.");
            }

            // Check for recent verification attempts
            var recentAttempts = await _context.UserOTPs
                .CountAsync(v => v.UserId == request.UserId
                    && v.OtpType == "EmailChange"
                    && v.CreatedAt >= DateTime.UtcNow.AddHours(-1));

            if (recentAttempts >= 3)
            {
                return BadRequest("Too many verification attempts. Please try again later.");
            }

            // Generate OTP
            var otp = new Random().Next(100000, 999999).ToString();

            // Store both the OTP and the new email
            var userOtp = new UserOtp
            {
                UserId = request.UserId,
                Otp = otp,
                OtpType = "EmailChange",
                ExpirationDate = DateTime.UtcNow.AddMinutes(5),
                CreatedAt = DateTime.UtcNow,
                IsVerified = false,
                Data = request.NewEmail
            };


            _context.UserOTPs.Add(userOtp);
            await _context.SaveChangesAsync();

            var emailBody = $@"
        You've requested to change your email address to {request.NewEmail}.
        Your verification code is: {otp}
        This code will expire in 5 minutes.
        
        If you didn't request this change, please contact support immediately.";

            await _emailService.SendAsync(
                request.NewEmail,
                "Verify Your New Email Address",
                emailBody
            );

            return Ok(new { message = "Verification email sent" });
        }

        [HttpPost("change-email-otp")]
        public async Task<IActionResult> VerifyEmailChange([FromBody] VerifyEmailChangeRequest request)
        {
            var latestOtp = await _context.UserOTPs
                .Where(u => u.UserId == request.UserId
                    && u.OtpType == "EmailChange"
                    && !u.IsVerified)
                .OrderByDescending(u => u.CreatedAt)
                .FirstOrDefaultAsync();

            if (latestOtp == null)
            {
                return BadRequest("No pending email verification found.");
            }

            if (latestOtp.ExpirationDate < DateTime.UtcNow)
            {
                return BadRequest("Verification code has expired.");
            }

            if (latestOtp.Otp != request.Otp)
            {
                return BadRequest("Invalid verification code.");
            }

            

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var newEmail = latestOtp.Data;

            var emailTaken = await _context.Users
                .AnyAsync(u => u.Email == newEmail && u.UserId != request.UserId);

            if (emailTaken)
            {
                return BadRequest("Email is already in use.");
            }


            string oldEmail = user.Email;
            user.Email = newEmail;
            latestOtp.IsVerified = true;
            await _context.SaveChangesAsync();

            // Send confirmation emails
            await _emailService.SendAsync(
                oldEmail,
                "Email Address Changed",
                "Your email address has been changed. If you didn't make this change, please contact support immediately."
            );

            await _emailService.SendAsync(
                newEmail,
                "Email Address Change Confirmed",
                "Your email address has been successfully updated."
            );

            return Ok("Email successfully updated.");
        }
    }

    public class EmailVerificationRequest
    {
        public string Email { get; set; }
    }

    public class SmsVerificationRequest
    {
        public string Email { get; set; }
        public string PhoneNo { get; set; }
    }

    public class OtpVerificationRequest
    {
        public string? Email { get; set; }
        public string? PhoneNo { get; set; }
        public string Otp { get; set; }
    }

    public class EmailChangeRequest
    {
        public int UserId { get; set; }
        public string NewEmail { get; set; }

        public string Email { get; set; }
    }

    public class VerifyEmailChangeRequest
    {
        public int UserId { get; set; }
        public string Otp { get; set; }
    }
}
