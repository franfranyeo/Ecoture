// formated with AI
using AutoMapper;
using Ecoture.Model.Entity;
using Ecoture.Model.Request;
using Ecoture.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CreditCardController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;

        public CreditCardController(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet, Authorize]
        public IActionResult GetAll()
        {
            try
            {
                int userId = GetUserId();
                var creditCards = _context.CreditCards
                    .Where(c => c.UserId == userId)
                    .ToList() // Fetch data into memory
                    .Select(c => new CreditCardDTO
                    {
                        Id = c.Id,
                        CardHolderName = c.CardHolderName,
                        LastFourDigits = c.CardNumber.Length >= 4 ? c.CardNumber[^4..] : "****", // Safe substring
                        ExpiryMonth = c.ExpiryMonth,
                        ExpiryYear = c.ExpiryYear,
                    })
                    .ToList();

                return Ok(creditCards);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}"), Authorize]
        public IActionResult GetCreditCard(int id)
        {
            try
            {
                int userId = GetUserId();
                var creditCard = _context.CreditCards
                    .FirstOrDefault(c => c.Id == id && c.UserId == userId);

                if (creditCard == null) return NotFound("Credit card not found.");

                var creditCardDTO = new CreditCardDTO
                {
                    Id = creditCard.Id,
                    CardHolderName = creditCard.CardHolderName,
                    LastFourDigits = creditCard.CardNumber.Length >= 4 ? creditCard.CardNumber[^4..] : "****",
                    ExpiryMonth = creditCard.ExpiryMonth,
                    ExpiryYear = creditCard.ExpiryYear
                };

                return Ok(creditCardDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost, Authorize]
        public IActionResult AddCreditCard(AddCreditCardRequest request)
        {
            try
            {
                int userId = GetUserId();

                // Validation for sensitive fields can be added here
                if (string.IsNullOrWhiteSpace(request.CardNumber) || request.CardNumber.Length < 4)
                    return BadRequest("Invalid card number.");

                var creditCard = new CreditCard
                {
                    CardHolderName = request.CardHolderName,
                    CardNumber = request.CardNumber, // Store encrypted in production
                    ExpiryMonth = request.ExpiryMonth,
                    ExpiryYear = request.ExpiryYear,
                    CVV = request.CVV, // Store encrypted in production
                    UserId = userId
                };

                _context.CreditCards.Add(creditCard);
                _context.SaveChanges();

                return Ok("Credit card added successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateCreditCard(int id, UpdateCreditCardRequest request)
        {
            try
            {
                int userId = GetUserId();

                var creditCard = _context.CreditCards
                    .FirstOrDefault(c => c.Id == id && c.UserId == userId);

                if (creditCard == null) return NotFound("Credit card not found.");

                if (!string.IsNullOrWhiteSpace(request.CardHolderName))
                    creditCard.CardHolderName = request.CardHolderName;
                if (!string.IsNullOrWhiteSpace(request.CardNumber))
                    creditCard.CardNumber = request.CardNumber; // Encrypt in production
                if (request.ExpiryMonth.HasValue)
                    creditCard.ExpiryMonth = request.ExpiryMonth.Value;
                if (request.ExpiryYear.HasValue)
                    creditCard.ExpiryYear = request.ExpiryYear.Value;
                if (!string.IsNullOrWhiteSpace(request.CVV))
                    creditCard.CVV = request.CVV; // Encrypt in production

                _context.SaveChanges();
                return Ok("Credit card updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}"), Authorize]
        public IActionResult DeleteCreditCard(int id)
        {
            try
            {
                int userId = GetUserId();

                var creditCard = _context.CreditCards
                    .FirstOrDefault(c => c.Id == id && c.UserId == userId);

                if (creditCard == null) return NotFound("Credit card not found.");

                _context.CreditCards.Remove(creditCard);
                _context.SaveChanges();
                return Ok("Credit card deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        }
    }
}
    