using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcotureAPI.Models.DTO;
using EcotureAPI.Models.Entity;
using EcotureAPI.Models.Request;
using AutoMapper;

namespace EcotureAPI.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class ResponseController(MyDbContext context, IMapper mapper, ILogger<ResponseController> logger) : ControllerBase
	{
		private readonly MyDbContext _context = context;
		private readonly IMapper _mapper = mapper;
		private readonly ILogger<ResponseController> _logger = logger;

		[HttpGet]
		[ProducesResponseType(typeof(IEnumerable<ResponseDTO>), StatusCodes.Status200OK)]
		public IActionResult GetAllResponses()
		{
			try
			{
				var responses = _context.Responses.Include(r => r.Enquiry).ToList();
				var responseDTOs = responses.Select(_mapper.Map<ResponseDTO>);
				return Ok(responseDTOs);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error fetching all responses.");
				return StatusCode(500, "Internal server error.");
			}
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetResponse(int id)
		{
			var response = await _context.Responses.Include(r => r.Enquiry).FirstOrDefaultAsync(r => r.responseId == id);
			if (response == null)
			{
				return NotFound("Response not found.");
			}
			return Ok(response);
		}

		[HttpPost]
		[ProducesResponseType(typeof(ResponseDTO), StatusCodes.Status200OK)]
		public IActionResult AddResponse(AddResponse responseRequest)
		{
			try
			{
				var enquiry = _context.Enquiries.Find(responseRequest.EnquiryId);
				if (enquiry == null)
				{
					return NotFound("Enquiry not found.");
				}

				var now = DateTime.UtcNow;
				var newResponse = new Response
				{
					enquiryId = responseRequest.EnquiryId,
					csoId = 0, 
					message = responseRequest.Message.Trim(),
					responseDate = now
				};

				_context.Responses.Add(newResponse);

				enquiry.updatedAt = now;
				_context.SaveChanges();

				var responseDTO = _mapper.Map<ResponseDTO>(newResponse);
				return Ok(responseDTO);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error adding response.");
				return StatusCode(500, "Internal server error.");
			}
		}

	}
}
