using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Collections.Generic;
using Ecoture.Model.Entity;

namespace Ecoture.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmailListController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly ILogger<EmailListController> _logger;

        public EmailListController(MyDbContext context, ILogger<EmailListController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetAllEmails()
        {
            try
            {
                var emails = _context.EmailLists
                    .Select(e => e.Email) 
                    .ToList();

                if (!emails.Any())
                {
                    return NotFound(new { message = "No emails found." });
                }

                return Ok(emails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching email list");
                return StatusCode(500, new { message = "Error retrieving email list." });
            }
        }

        [HttpPost]
        public IActionResult Subscribe([FromBody] EmailList emailEntry)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existingEmail = _context.EmailLists.FirstOrDefault(e => e.Email == emailEntry.Email);
                if (existingEmail != null)
                    return Conflict(new { message = "This email is already subscribed." });

                emailEntry.SubscribedAt = DateTime.UtcNow;
                _context.EmailLists.Add(emailEntry);
                _context.SaveChanges();

                return Ok(new { message = "Successfully subscribed!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error subscribing user");
                return StatusCode(500, new { message = "Internal server error while subscribing." });
            }
        }
    }
}