using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecoture.Models.Entity;
using Ecoture.Models.DTO;
using Ecoture.Models.Request;
using System.Security.Claims;
using AutoMapper;

namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CartController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;

        public CartController(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ✅ Add item to cart
        [HttpPost, Authorize]
        public IActionResult AddToCart([FromBody] AddToCartRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request. Please provide cart details." });
            }
            if (request.ProductId <= 0)
            {
                return BadRequest(new { message = "Invalid product ID." });
            }
            if (string.IsNullOrEmpty(request.Color))
            {
                return BadRequest(new { message = "Color is required." });
            }
            if (string.IsNullOrEmpty(request.Size))
            {
                return BadRequest(new { message = "Size is required." });
            }


            int userId = GetUserId();

            // ✅ Check if the item already exists in the cart (same product, size, and color)
            var existingCartItem = _context.Carts
                .FirstOrDefault(c => c.UserId == userId && c.ProductId == request.ProductId && c.Color == request.Color && c.Size == request.Size);

            if (existingCartItem != null)
            {
                existingCartItem.Quantity += request.Quantity; // Increase quantity
            }
            else
            {
                Cart newCartItem = _mapper.Map<Cart>(request);
                newCartItem.UserId = userId;
                _context.Carts.Add(newCartItem);
            }

            _context.SaveChanges();
            return Ok(new { message = "Item added to cart successfully!" });
        }

        [HttpGet, Authorize]
        public IActionResult GetCart()
        {
            int userId = GetUserId();

            var cartItems = _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product) // ✅ Ensure product data is included
                .ToList();

            return Ok(_mapper.Map<List<CartDTO>>(cartItems));
        }




        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }
            return int.Parse(userIdClaim.Value);
        }


        [HttpDelete("{id}"), Authorize]
        public IActionResult RemoveFromCart(int id)
        {
            try
            {
                int userId = GetUserId();


                var cartItem = _context.Carts
                    .FirstOrDefault(c => c.Id == id && c.UserId == userId);

                // If the item is not found, return a NotFound status
                if (cartItem == null)
                {
                    return NotFound("Item not found in cart.");
                }

                // Remove the item from the cart
                _context.Carts.Remove(cartItem);
                _context.SaveChanges(); // Save changes to the database

                // Return a success message
                return Ok("Item removed from cart successfully.");
            }

            catch (Exception ex)
            {
                // Return an internal server error if an exception occurs
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
