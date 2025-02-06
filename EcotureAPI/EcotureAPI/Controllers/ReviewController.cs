using AutoMapper;
using EcotureAPI.Models.Entity;
using EcotureAPI.Models.Request;
using EcotureAPI.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcotureAPI.Controllers
{
    [ApiController]
    [Route("reviews")] // Matches RESTful conventions
    public class ReviewController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;

        public ReviewController(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Retrieves reviews for a specific product.
        /// </summary>
        /// <param name="productId">The ID of the product for which reviews are requested.</param>
        /// <returns>List of reviews for the specified product.</returns>
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetReviews(int productId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.User) // Include User to fetch reviewer details
                    .Where(r => r.ProductId == productId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                if (reviews == null || !reviews.Any())
                {
                    return NotFound($"No reviews found for product with ID {productId}.");
                }

                // Map to ReviewDTO for frontend
                var reviewDTOs = reviews.Select(r => new ReviewDTO
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    Comment = r.Comment,
                    Rating = r.Rating,
                    Username = $"{r.User?.FirstName ?? "Unknown"} {r.User?.LastName ?? ""}".Trim(),
                    CreatedAt = r.CreatedAt
                });

                return Ok(reviewDTOs);
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error fetching reviews for productId {productId}: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching reviews.");
            }
        }

        /// <summary>
        /// Adds a new review for a product.
        /// </summary>
        /// <param name="request">The review request object containing productId, comment, and rating.</param>
        /// <returns>The created review as a ReviewDTO.</returns>
        [HttpPost, Authorize]
        public async Task<IActionResult> AddReview([FromBody] AddReviewRequest request)
        {
            try
            {
                var userId = GetUserId(); // Get authenticated user's ID
                var productExists = await _context.Products.AnyAsync(p => p.Id == request.ProductId);

                if (!productExists)
                {
                    return NotFound("Product not found.");
                }

                // Create a new Review entity
                var review = new Review
                {
                    ProductId = request.ProductId,
                    UserId = userId,
                    Comment = request.Comment,
                    Rating = request.Rating,
                    CreatedAt = DateTime.Now
                };

                await _context.Reviews.AddAsync(review); // Add to database
                await _context.SaveChangesAsync(); // Save changes
                var user = await _context.Users.FindAsync(userId);

                // Map to ReviewDTO and return
                var reviewDTO = new ReviewDTO
                {
                    Id = review.Id,
                    ProductId = review.ProductId,
                    Comment = review.Comment,
                    Rating = review.Rating,
                    Username = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Unknown",
                    CreatedAt = review.CreatedAt
                };

                return Ok(reviewDTO);
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error adding review: {ex.Message}");
                return StatusCode(500, "An error occurred while adding the review.");
            }
        }

        /// <summary>
        /// Updates an existing review.
        /// </summary>
        /// <param name="id">The ID of the review to update.</param>
        /// <param name="request">The updated review data.</param>
        /// <returns>The updated review as a ReviewDTO.</returns>
        [HttpPut("{id}"), Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] AddReviewRequest request)
        {
            try
            {
                var userId = GetUserId(); // Get authenticated user's ID

                // Fetch the review to update
                var review = await _context.Reviews.FindAsync(id);

                if (review == null)
                {
                    return NotFound("Review not found.");
                }

                // Optional: Check if the logged-in user is the owner of the review
                if (review.UserId != userId)
                {
                    return Forbid("You are not authorized to edit this review.");
                }

                // Update the review's fields
                review.Comment = request.Comment;
                review.Rating = request.Rating;

                _context.Reviews.Update(review); // Mark the review as updated
                await _context.SaveChangesAsync(); // Save changes to the database
                var user = await _context.Users.FindAsync(userId);

                // Map to ReviewDTO and return
                var reviewDTO = new ReviewDTO
                {
                    Id = review.Id,
                    ProductId = review.ProductId,
                    Comment = review.Comment,
                    Rating = review.Rating,
                    Username = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Unknown",
                    CreatedAt = review.CreatedAt
                };

                return Ok(reviewDTO);
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error updating review with ID {id}: {ex.Message}");
                return StatusCode(500, "An error occurred while updating the review.");
            }
        }

        /// <summary>
        /// Deletes a review by its ID.
        /// </summary>
        /// <param name="id">The ID of the review to delete.</param>
        /// <returns>Result of the deletion operation.</returns>
        [HttpDelete("{id}"), Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var userId = GetUserId(); // Get authenticated user's ID

                // Fetch the review to delete
                var review = await _context.Reviews.FindAsync(id);

                if (review == null)
                {
                    return NotFound("Review not found.");
                }

                // Optional: Check if the logged-in user is the owner of the review
                if (review.UserId != userId)
                {
                    return Forbid("You are not authorized to delete this review.");
                }

                _context.Reviews.Remove(review);  // Remove the review
                await _context.SaveChangesAsync();  // Save changes to the database

                return Ok(new { message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting review with ID {id}: {ex.Message}");
                return StatusCode(500, "An error occurred while deleting the review.");
            }
        }

        /// <summary>
        /// Helper method to get the authenticated user's ID.
        /// </summary>
        /// <returns>The user's ID from the authentication claims.</returns>
        private int GetUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            return Convert.ToInt32(userIdClaim);
        }
    }
}
