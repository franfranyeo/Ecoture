using Microsoft.AspNetCore.Mvc;
using Ecoture.Model.Entity;
using Ecoture.Model.DTO;
using Microsoft.EntityFrameworkCore;

namespace Ecoture.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class ContentController : ControllerBase
	{
		private readonly MyDbContext _context;

		public ContentController(MyDbContext context)
		{
			_context = context;
		}

        [HttpGet("{id}")]
		public async Task<IActionResult> GetContentById(int id)
		{
			var content = await _context.Contents.FindAsync(id);
			if (content == null)
				return NotFound(new { message = "Content not found" });

			return Ok(content);
		}

		[HttpPost]
		[ProducesResponseType(typeof(ContentDto), StatusCodes.Status200OK)]
		public async Task<IActionResult> CreateContent([FromBody] ContentDto contentDto)
		{
			if (contentDto == null || contentDto.ProductIds == null || !contentDto.ProductIds.Any())
				return BadRequest(new { message = "Invalid content data" });

			foreach (var productId in contentDto.ProductIds)
			{
				if (!await _context.Products.AnyAsync(p => p.Id == productId))
				{
					return BadRequest(new { message = $"Invalid ProductId: {productId}" });
				}
			}

			var content = new Content
			{
				ProductIds = contentDto.ProductIds
			};

			try
			{
				await _context.Contents.AddAsync(content);
				await _context.SaveChangesAsync();
				return Ok(contentDto);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "An error occurred while creating content", error = ex.Message });
			}
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateContent(int id, [FromBody] ContentDto contentDto)
		{
			if (contentDto == null)
				return BadRequest(new { message = "Invalid content data" });

			var content = await _context.Contents.FindAsync(id);
			if (content == null)
				return NotFound(new { message = "Content not found" });

			content.ProductIds = contentDto.ProductIds;
			content.PreferencesId = contentDto.PreferencesId;
			content.ContentTitle = contentDto.ContentTitle;
            content.Membership = contentDto.Membership;

			try
			{
				await _context.SaveChangesAsync();
				return Ok(content);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "An error occurred while updating content", error = ex.Message });
			}
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteContent(int id)
		{
			var content = await _context.Contents.FindAsync(id);
			if (content == null)
				return NotFound(new { message = "Content not found" });

			try
			{
				_context.Contents.Remove(content);
				await _context.SaveChangesAsync();
				return NoContent();
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "An error occurred while deleting content", error = ex.Message });
			}
		}
	}
}
