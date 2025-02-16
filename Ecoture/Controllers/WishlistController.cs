using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecoture.Model.Entity;
using Ecoture.Model.DTO;
using Ecoture.Model.Request;
using System.Security.Claims;

namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly MyDbContext _context;

        public WishlistController(MyDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            return Convert.ToInt32(userIdClaim);
        }

        // ✅ Get all wishlist items for logged-in user
        [HttpGet, Authorize]
        public async Task<IActionResult> GetWishlist()
        {
            int userId = GetUserId();

            var wishlistItems = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .Select(w => new WishlistDTO
                {
                    ProductId = w.Product.Id,
                    ProductTitle = w.Product.Title,
                    ProductImage = w.Product.ImageFile,
                    ProductPrice = w.Product.Price,
                    AddedAt = w.CreatedAt
                })
                .ToListAsync();

            return Ok(wishlistItems);
        }

        // ✅ Add product to wishlist
        [HttpPost, Authorize]
        public async Task<IActionResult> AddToWishlist([FromBody] AddToWishlistRequest request)
        {
            int userId = GetUserId();

            // Check if product exists
            var productExists = await _context.Products.AnyAsync(p => p.Id == request.ProductId);
            if (!productExists)
                return NotFound(new { Message = "Product not found." });

            // Check if already in wishlist
            bool exists = await _context.Wishlists.AnyAsync(w => w.UserId == userId && w.ProductId == request.ProductId);
            if (exists)
                return BadRequest(new { Message = "Product already in wishlist." });

            var wishlistItem = new Wishlist
            {
                UserId = userId,
                ProductId = request.ProductId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Wishlists.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Product added to wishlist." });
        }

        // ✅ Remove product from wishlist
        [HttpDelete("{productId}"), Authorize]
        public async Task<IActionResult> RemoveFromWishlist(int productId)
        {
            int userId = GetUserId();

            var wishlistItem = await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);
            if (wishlistItem == null)
                return NotFound(new { Message = "Product not found in wishlist." });

            _context.Wishlists.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Product removed from wishlist." });
        }
    }
}
