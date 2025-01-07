using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Models.Request;
using Models.Entity;
using Ecoture.Models.Enum;
using Ecoture.Models.Request;



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
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            // trim string values
            request.firstName = request.firstName.Trim();
            request.lastName = request.lastName.Trim();
            request.email = request.email.Trim();
            request.password = request.password.Trim();

            // Validate the agreedToTerms field
            if (!request.agreedToTerms)
            {
                string message = "You must agree to the terms of use and privacy policy.";
                return BadRequest(new { message });
            }

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
                agreedToTerms = true,
                agreedToTermsAt = DateTime.UtcNow,
                createdAt = now,
                updatedAt = now
            };

            // Add user 
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok();
        }


        // LOGIN USER
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
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

            // Check if the account is soft-deleted
            if (user.deleteRequested)
            {
                var gracePeriod = TimeSpan.FromDays(30);
                var timeSinceRequest = DateTime.UtcNow - user.deleteRequestedAt;

                if (timeSinceRequest <= gracePeriod)
                {
                    // Reactivate account
                    user.deleteRequested = false;
                    user.deleteRequestedAt = null;
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Your account has been reactivated." });
                }
                else
                {
                    return Unauthorized(new { message = "Your account has been permanently deleted." });
                }
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
        public async Task<IActionResult> Auth()
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

            if (user.role != UserRole.Admin)
            {
                return Unauthorized();
            }

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
            var staff = new User()
            {
                firstName = request.firstName,
                lastName = request.lastName,
                email = request.email,
                password = passwordHash,
                role = UserRole.Staff,
                createdAt = now,
                updatedAt = now
            };
            // Add user 
            _context.Users.Add(staff);
            await _context.SaveChangesAsync();
            return Ok();
        }


        // UPDATE USER ACCOUNT
        [HttpPut("{id}"), Authorize]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserInfoRequest request)
        {
            // Find the user
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Get logged-in user's ID and role
            var loggedInUserId = Convert.ToInt32(User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
            var loggedInUserRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            // Authorisation: Ensure the user can only update their own account or is an admin
            if (user.userId != loggedInUserId && loggedInUserRole != UserRole.Admin.ToString())
            {
                return Unauthorized(new { message = "You are not authorised to update this account." });
            }

            // Update fields
            try
            {
                // Trim and validate required fields
                user.firstName = request.firstName.Trim();
                user.lastName = request.lastName.Trim();
                user.email = request.email.Trim();

                // Validate email uniqueness if it can be updated
                var emailExists = _context.Users.Any(u => u.email == request.email && u.userId != id);
                if (emailExists)
                {
                    return BadRequest(new { message = "Email already exists." });
                }

                user.mobileNo = request.mobileNo.Trim();

                // Validate the date of birth if provided (ensure it's a valid past date)
                if (request.dateofBirth != default(DateTime) && request.dateofBirth > DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Date of birth must be in the past." });
                }
                user.dateofBirth = request.dateofBirth;

                // Update the profile picture URL if provided
                if (!string.IsNullOrEmpty(request.pfpURL))
                {
                    user.pfpURL = request.pfpURL.Trim();
                }

                user.updatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "User updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the user.", error = ex.Message });
            }
        }


        // CUSTOMER DELETE ACCOUNT (2 STEPS)
        // Step 1: Request account deletion
        [HttpPost("{id}/delete-request"), Authorize]
        public async Task<IActionResult> RequestDeletion(int id)
        {
            // Get logged-in user's ID and role
            var loggedInUserId = Convert.ToInt32(User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
            var loggedInUserRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            // Find the target user
            var userToDelete = await _context.Users.FindAsync(id);
            if (userToDelete == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Customers can only request deletion for their own accounts
            if (loggedInUserRole == UserRole.Customer.ToString() && loggedInUserId != id)
            {
                return Unauthorized(new { message = "You can only delete your own account." });
            }

            // If deletion is already requested, return an error
            if (userToDelete.deleteRequested)
            {
                return BadRequest(new { message = "Account deletion already requested." });
            }

            // Mark account as deletion requested
            userToDelete.deleteRequested = true;
            userToDelete.deleteRequestedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account deletion requested." });
        }


        // Step 2: Permenant account deletion
        [HttpPost("{id}/permanent-delete"), Authorize]
        public async Task<IActionResult> PermanentDelete(int id)
        {
            // Get logged-in user's role
            var loggedInUserRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            // Find the target user
            var userToDelete = await _context.Users.FindAsync(id);
            if (userToDelete == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Only Admins can perform permanent deletion
            if (loggedInUserRole != UserRole.Admin.ToString())
            {
                return Unauthorized(new { message = "You are not authorized to permanently delete this account." });
            }

            // Ensure deletion request exists and grace period has expired
            if (!userToDelete.deleteRequested || !userToDelete.deleteRequestedAt.HasValue)
            {
                return BadRequest(new { message = "Deletion request not made." });
            }

            var deletionRequestTime = userToDelete.deleteRequestedAt.Value;
            if ((DateTime.UtcNow - deletionRequestTime).TotalDays < 30)
            {
                return BadRequest(new { message = "You must wait 30 days before permanent deletion." });
            }

            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User account permanently deleted." });
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

            if (loggedInUserRole == UserRole.Staff.ToString() && userToDelete.role != UserRole.Customer)
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



    }
}
