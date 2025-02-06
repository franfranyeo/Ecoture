using Microsoft.AspNetCore.Mvc;
using Ecoture.Models.Entity;
using Ecoture.Models.DTO;
using Microsoft.EntityFrameworkCore;

namespace Ecoture.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class NewsletterController : ControllerBase
	{
		private readonly MyDbContext _context;

		public NewsletterController(MyDbContext context)
		{
			_context = context;
		}

		[HttpGet("{id}")]
		public IActionResult GetNewsletterById(int id)
		{
			var newsletter = _context.Newsletters.Include(n => n.Contents) .FirstOrDefault(n => n.IssueId == id);

			if (newsletter == null)
				return NotFound();

			return Ok(newsletter);

		}

		[HttpPost]
		public IActionResult CreateNewsletter([FromBody] NewsletterDto newsletterDto)
		{
			var newsletter = new Newsletter
			{
				IssueTitle = newsletterDto.IssueTitle,
				ContentId = newsletterDto.ContentId,
				DateSent = newsletterDto.DateSent,
				NewsletterCategory = newsletterDto.NewsletterCategory
			};

			_context.Newsletters.Add(newsletter);
			_context.SaveChanges();
			return Ok(newsletterDto);
		}

		[HttpPut("{id}")]
		public IActionResult UpdateNewsletter(int id, [FromBody] NewsletterDto newsletterDto)
		{
			var newsletter = _context.Newsletters.Find(id);
			if (newsletter == null)
				return NotFound();

			newsletter.IssueTitle = newsletterDto.IssueTitle;
			newsletter.ContentId = newsletterDto.ContentId;
			newsletter.DateSent = newsletterDto.DateSent;
			newsletter.NewsletterCategory = newsletterDto.NewsletterCategory;

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
	}
}
