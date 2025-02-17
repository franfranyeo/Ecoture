using Microsoft.AspNetCore.Mvc;
using Ecoture.Model.Entity;
using System.Net;
using System.Net.Mail;


namespace Ecoture.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class NewsletterController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;


        public NewsletterController(MyDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult GetAllNewsletters()
        {
            var newsletters = _context.Newsletters.ToList();
            return Ok(newsletters);
        }

        [HttpGet("{id}")]
        public IActionResult GetNewsletterById(int id)
        {
            var newsletter = _context.Newsletters.FirstOrDefault(n => n.IssueId == id);
            if (newsletter == null)
                return NotFound();

            return Ok(newsletter);
        }

        [HttpPost]
        public IActionResult CreateNewsletter([FromBody] Newsletter newsletter)
        {
            if (newsletter == null)
                return BadRequest("Invalid newsletter data.");

            newsletter.DateCreated = DateTime.UtcNow;

            _context.Newsletters.Add(newsletter);
            _context.SaveChanges();
            return Ok(newsletter);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteNewsletter(int id)
        {
            var newsletter = _context.Newsletters.Find(id);
            if (newsletter == null)
                return NotFound();

            _context.Newsletters.Remove(newsletter);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPost("send/{id}")]
        public async Task<IActionResult> SendNewsletter(int id, [FromBody] List<string> recipientEmails)
        {
            var newsletter = _context.Newsletters.FirstOrDefault(n => n.IssueId == id);
            if (newsletter == null)
                return NotFound(new { message = "Newsletter not found." });

            if (string.IsNullOrEmpty(newsletter.Template))
                return BadRequest(new { message = "Newsletter template is empty." });

            string senderEmail = _configuration["EmailSettings:SenderEmail"];
            string senderPassword = _configuration["EmailSettings:SenderPassword"];
            string smtpHost = _configuration["EmailSettings:SmtpHost"];
            int smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);

            try
            {
                var smtpClient = new SmtpClient(smtpHost)
                {
                    Port = smtpPort,
                    Credentials = new NetworkCredential(senderEmail, senderPassword),
                    EnableSsl = true
                };

                foreach (var recipientEmail in recipientEmails)
                {
                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail),
                        Subject = newsletter.IssueTitle,
                        Body = newsletter.Template,
                        IsBodyHtml = true
                    };
                    mailMessage.To.Add(recipientEmail);

                    await smtpClient.SendMailAsync(mailMessage);
                }

                return Ok(new { message = $"Newsletter sent successfully to {recipientEmails.Count} recipients." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send email.", error = ex.Message });
            }
        }


    }
}
