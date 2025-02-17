using Microsoft.AspNetCore.Mvc;
using Ecoture.Model.Entity;
using Ecoture.Services;
using Ecoture.Model.Request;


namespace Ecoture.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class NewsletterController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;


        public NewsletterController(MyDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
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
        public async Task<IActionResult> SendNewsletter(int id, [FromBody] NewsletterRequest request)
        {
            var newsletter = _context.Newsletters.FirstOrDefault(n => n.IssueId == id);
            if (newsletter == null)
                return NotFound(new { message = "Newsletter not found." });

            if (request == null || request.RecipientEmails == null || request.RecipientEmails.Count == 0)
                return BadRequest(new { message = "Recipient list is empty or invalid." });

            try
            {
                Console.WriteLine($"Retrieving newsletter template for Issue ID {id}...");

                //string htmlContent;
                //try
                //{
                //    var design = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(request.Template);
                //    htmlContent = ConvertJsonToHtml(design);
                //}
                //catch (Exception jsonEx)
                //{
                //    Console.WriteLine($"Error parsing JSON template: {jsonEx.Message}");
                //    return BadRequest(new { message = "Failed to process newsletter template." });
                //}

                Console.WriteLine($"Sending newsletter to: {string.Join(", ", request.RecipientEmails)}");

                foreach (var recipientEmail in request.RecipientEmails)
                {
                    if (!string.IsNullOrWhiteSpace(recipientEmail))
                    {
                        await _emailService.SendAsync(recipientEmail, request.Subject, request.Template);
                        Console.WriteLine($"Email sent to {recipientEmail}");
                    }
                }

                return Ok(new { message = $"Newsletter sent successfully to {request.RecipientEmails.Count} recipients." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending emails: {ex.Message}");
                return StatusCode(500, new { message = "Failed to send email.", error = ex.Message });
            }
        }

        private string ConvertJsonToHtml(dynamic design)
        {
            try
            {
                var htmlBuilder = new System.Text.StringBuilder();
                htmlBuilder.Append("<html><body>");

                foreach (var row in design.body.rows)
                {
                    htmlBuilder.Append("<div style='margin-bottom: 20px;'>");

                    foreach (var cell in row.cells)
                    {
                        foreach (var content in cell.contents)
                        {
                            if (content.type == "text")
                            {
                                htmlBuilder.Append($"<p>{content.values.text}</p>");
                            }
                            else if (content.type == "image")
                            {
                                htmlBuilder.Append($"<img src='{content.values.src.url}' alt='' style='max-width:100%;'/>");
                            }
                        }
                    }

                    htmlBuilder.Append("</div>");
                }

                htmlBuilder.Append("</body></html>");
                return htmlBuilder.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error converting JSON to HTML: {ex.Message}");
                return "<html><body><p>Error loading newsletter content.</p></body></html>";
            }
        }


    }
}
