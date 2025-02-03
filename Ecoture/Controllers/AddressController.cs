// formated with AI
using AutoMapper;
using Ecoture.Models.Entity;
using Ecoture.Models.Request;
using Ecoture.Models.Enum;
using Ecoture.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AddressController> _logger;

        public AddressController(MyDbContext context, IMapper mapper, ILogger<AddressController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // Get all addresses for the authenticated user
        [HttpGet, Authorize]
        [ProducesResponseType(typeof(IEnumerable<AddressDTO>), StatusCodes.Status200OK)]
        public IActionResult GetAll(string? search)
        {
            try
            {
                // Get the logged-in user's ID
                int userId = GetUserId();

                // Query addresses for the logged-in user only
                IQueryable<Address> result = _context.Addresses
                    .Include(a => a.User)
                    .Where(a => a.UserId == userId);

                if (!string.IsNullOrEmpty(search))
                {
                    result = result.Where(a => a.Title.Contains(search) || a.Description.Contains(search));
                }

                var list = result.OrderByDescending(a => a.CreatedAt).ToList();
                IEnumerable<AddressDTO> data = list.Select(_mapper.Map<AddressDTO>);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when retrieving addresses");
                return StatusCode(500);
            }
        }

        // Get a specific address by ID for the authenticated user
        [HttpGet("{id}"), Authorize]
        [ProducesResponseType(typeof(AddressDTO), StatusCodes.Status200OK)]
        public IActionResult GetAddress(int id)
        {
            try
            {
                int userId = GetUserId();

                // Find the address and ensure it belongs to the logged-in user
                Address? address = _context.Addresses
                    .Include(a => a.User)
                    .SingleOrDefault(a => a.Id == id && a.UserId == userId);

                if (address == null)
                {
                    return NotFound();
                }

                AddressDTO data = _mapper.Map<AddressDTO>(address);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when retrieving address by ID");
                return StatusCode(500);
            }
        }

        // Add a new address
        [HttpPost, Authorize]
        [ProducesResponseType(typeof(AddressDTO), StatusCodes.Status200OK)]
        public IActionResult AddAddress(AddAddressRequest address)
        {
            try
            {
                int userId = GetUserId();
                var now = DateTime.Now;

                // Create a new address for the logged-in user
                var newAddress = new Address()
                {
                    Title = address.Title.Trim(),
                    Description = address.Description.Trim(),
                    ImageFile = address.ImageFile,
                    CreatedAt = now,
                    UpdatedAt = now,
                    UserId = userId
                };

                _context.Addresses.Add(newAddress);
                _context.SaveChanges();

                Address? createdAddress = _context.Addresses
                    .Include(a => a.User)
                    .FirstOrDefault(a => a.Id == newAddress.Id);

                AddressDTO addressDTO = _mapper.Map<AddressDTO>(createdAddress);
                return Ok(addressDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when adding address");
                return StatusCode(500);
            }
        }

        // Update an existing address
        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateAddress(int id, UpdateAddressRequest address)
        {
            try
            {
                var existingAddress = _context.Addresses.Find(id);
                if (existingAddress == null)
                {
                    return NotFound();
                }

                int userId = GetUserId();
                if (existingAddress.UserId != userId)
                {
                    return Forbid();
                }

                // Update fields only if provided
                if (!string.IsNullOrEmpty(address.Title))
                {
                    existingAddress.Title = address.Title.Trim();
                }
                if (!string.IsNullOrEmpty(address.Description))
                {
                    existingAddress.Description = address.Description.Trim();
                }
                if (!string.IsNullOrEmpty(address.ImageFile))
                {
                    existingAddress.ImageFile = address.ImageFile;
                }

                existingAddress.UpdatedAt = DateTime.Now;
                _context.SaveChanges();

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when updating address");
                return StatusCode(500);
            }
        }

        // Delete an address
        [HttpDelete("{id}"), Authorize]
        public IActionResult DeleteAddress(int id)
        {
            try
            {
                var address = _context.Addresses.Find(id);
                if (address == null)
                {
                    return NotFound();
                }

                int userId = GetUserId();
                if (address.UserId != userId)
                {
                    return Forbid();
                }

                _context.Addresses.Remove(address);
                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when deleting address");
                return StatusCode(500);
            }
        }

        // Helper method to get the ID of the authenticated user
        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value)
                .SingleOrDefault());
        }
    }
}
