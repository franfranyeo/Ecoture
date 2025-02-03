using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecoture.Models.DTO;
using Ecoture.Models.Entity;
using AutoMapper;
using Ecoture.Models.Enum;
using Ecoture.Models.Request;

namespace Ecoture.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class EnquiryController (MyDbContext context, IMapper mapper,
		ILogger<EnquiryController> logger): ControllerBase
	{
		private readonly MyDbContext _context = context;
		private readonly IMapper _mapper = mapper;
		private readonly ILogger<EnquiryController> _logger = logger;

		[HttpGet]
		[ProducesResponseType(typeof(EnquiryDTO), StatusCodes.Status200OK)]
		public IActionResult GetAll(string? search)
		{
			try
			{
				IQueryable<Enquiry> result = _context.Enquiries.Include(e => e.Responses);
				if (search != null)
				{
					result = result.Where(x => x.subject.Contains(search) || x.message.Contains(search));
				}
				var list = result.OrderByDescending(x => x.createdAt).ToList();
				IEnumerable<EnquiryDTO> data = list.Select(_mapper.Map<EnquiryDTO>);
				return Ok(data);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error when get all enquiries");
				return StatusCode(500);
			}
		}

		[HttpGet("{id}")]
		[ProducesResponseType(typeof(EnquiryDTO), StatusCodes.Status200OK)]
		public IActionResult GetEnquiry(int id)
		{
			try
			{
				Enquiry? enquiry = _context.Enquiries.Include(e => e.Responses)
					.SingleOrDefault(e => e.enquiryId == id);
				if (enquiry == null)
				{
					return NotFound();
				}
				EnquiryDTO data = _mapper.Map<EnquiryDTO>(enquiry);
				return Ok(data);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error when get enquiry by id");
				return StatusCode(500);
			}
		}

		[HttpGet("Summary")]
		public IActionResult GetEnquirySummary()
		{
			var total = _context.Enquiries.Count();
			var open = _context.Enquiries.Count(e => e.status == EnquiryStatus.Open);
			var closed = _context.Enquiries.Count(e => e.status == EnquiryStatus.Closed);
			var inProgress = _context.Enquiries.Count(e => e.status == EnquiryStatus.InProgress);

			return Ok(new
			{
				total,
				open,
				closed,
				inProgress
			});
		}

		[HttpPost]
		[ProducesResponseType(typeof(EnquiryDTO), StatusCodes.Status200OK)]
		public IActionResult AddEnquiry(Enquiry enquiryRequest)
		{
			try
			{
				var now = DateTime.UtcNow;
				var myEnquiry = new Enquiry
				{
					email = enquiryRequest.email.Trim(),
					subject = enquiryRequest.subject.Trim(),
					message = enquiryRequest.message.Trim(),
					status = Models.Enum.EnquiryStatus.Open,
					createdAt = now,
					updatedAt = now
				};

				_context.Enquiries.Add(myEnquiry);
				_context.SaveChanges();

				Enquiry? newEnquiry = _context.Enquiries.Include(e => e.Responses)
					.FirstOrDefault(e => e.enquiryId == myEnquiry.enquiryId);

				EnquiryDTO enquiryDTO = _mapper.Map<EnquiryDTO>(newEnquiry);
				return Ok(enquiryDTO);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error when adding enquiry");
				return StatusCode(500);
			}
		}


		[HttpPut("{id}")]
		public IActionResult UpdateEnquiry(int id, UpdateEnquiryRequest updatedEnquiry)
		{
			try
			{
				var myEnquiry = _context.Enquiries.Find(id);
				if (myEnquiry == null)
				{
					return NotFound("Enquiry not found.");
				}
				myEnquiry.status = updatedEnquiry.Status;
				myEnquiry.updatedAt = DateTime.UtcNow;
				_context.SaveChanges();
				return Ok();

			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error when updating enquiry");
				return StatusCode(500);
			}
		}

		[HttpDelete("{id}")]
		public IActionResult DeleteEnquiry(int id)
		{
			try
			{
				var enquiry = _context.Enquiries.Find(id);
				if (enquiry == null)
				{
					return NotFound("Enquiry not found.");
				}
				_context.Enquiries.Remove(enquiry);
				_context.SaveChanges();
				return Ok();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error when deleting enquiry");
				return StatusCode(500);
			}
		}
	}
}
