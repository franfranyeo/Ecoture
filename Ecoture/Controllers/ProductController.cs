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
    public class ProductController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ProductController> _logger;

        // Constructor
        public ProductController(MyDbContext context, IMapper mapper, ILogger<ProductController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        private PriceRange DeterminePriceRange(decimal price)
        {
            if (price < 10) return PriceRange.TenToTwenty; // Default to lowest tier
            if (price <= 20) return PriceRange.TenToTwenty;
            if (price <= 30) return PriceRange.TwentyToThirty;
            if (price <= 40) return PriceRange.ThirtyToForty;
            if (price <= 50) return PriceRange.FortyToFifty;
            return PriceRange.FiftyPlus;
        }


        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(string? search)
        {
            try
            {
                IQueryable<Product> query = _context.Products
                    .Include(t => t.User)
                    .Include(t => t.ProductSizes)
                        .ThenInclude(ps => ps.Size)
                    .Include(p => p.ProductColors) // Include ProductColors
                        .ThenInclude(pc => pc.Color); // Include related Color data

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(x => x.Title.Contains(search) || x.Description.Contains(search));
                }

                var result = await query.OrderByDescending(x => x.CreatedAt).ToListAsync();
                var data = result.Select(_mapper.Map<ProductDTO>);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting all products");
                return StatusCode(500, new
                {
                    Message = "An error occurred while retrieving products.",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(t => t.User)
                    .Include(p => p.ProductSizes)
                        .ThenInclude(ps => ps.Size)
                    .Include(p => p.ProductColors) // Include ProductColors
                        .ThenInclude(pc => pc.Color) // Include related Color 
                    .SingleOrDefaultAsync(t => t.Id == id);

                if (product == null)
                {
                    return NotFound("Product not found.");
                }

                var productDTO = _mapper.Map<ProductDTO>(product);
                return Ok(productDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error when getting product with ID {id}");
                return StatusCode(500, new
                {
                    Message = "An error occurred while retrieving the product.",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost, Authorize]
        [ProducesResponseType(typeof(ProductDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> AddProduct([FromBody] AddProductRequest product)
        {
            try
            {
                if (product.Sizes == null || !product.Sizes.Any())
                {
                    return BadRequest("At least one size must be provided.");
                }

                if (product.Colors == null || !product.Colors.Any())
                {
                    return BadRequest("At least one color must be provided.");
                }

                // Get user ID from the current authenticated user
                int userId = GetUserId();
                var now = DateTime.Now;

                // Determine Price Range based on Price
                var calculatedPriceRange = DeterminePriceRange(product.Price);

                var myProduct = new Product
                {
                    Title = product.Title.Trim(),
                    Description = product.Description.Trim(),
                    LongDescription = product.LongDescription.Trim(),
                    Price = product.Price,
                    StockQuantity = product.Sizes.Sum(s => s.StockQuantity),
                    CategoryName = product.CategoryName.Trim(),
                    Fit = product.Fit.Trim(),
                    PriceRange = calculatedPriceRange, // Automatically assign Price Range
                    ImageFile = product.ImageFile ?? string.Empty,
                    CreatedAt = now,
                    UpdatedAt = now,
                    UserId = userId
                };

                await _context.Products.AddAsync(myProduct);
                await _context.SaveChangesAsync();

                var newProduct = await _context.Products
                    .Include(p => p.User)
                    .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                    .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                    .FirstOrDefaultAsync(p => p.Id == myProduct.Id);

                var productDTO = _mapper.Map<ProductDTO>(newProduct);
                return Ok(productDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when adding product: {@Product}", product);
                return StatusCode(500, new { Message = "An error occurred while adding the product.", Error = ex.Message });
            }
        }


        [HttpPut("{id}"), Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest product)
        {
            try
            {
                var myProduct = await _context.Products
                    .Include(p => p.ProductSizes)
                        .ThenInclude(ps => ps.Size)
                    .Include(p => p.ProductColors)
                        .ThenInclude(pc => pc.Color)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (myProduct == null)
                {
                    return NotFound("Product not found.");
                }

                int userId = GetUserId();
                if (myProduct.UserId != userId)
                {
                    return Forbid("You are not authorized to update this product.");
                }

                // Update product properties
                if (!string.IsNullOrWhiteSpace(product.Title)) myProduct.Title = product.Title.Trim();
                if (!string.IsNullOrWhiteSpace(product.Description)) myProduct.Description = product.Description.Trim();
                if (!string.IsNullOrWhiteSpace(product.LongDescription)) myProduct.LongDescription = product.LongDescription.Trim();
                if (product.Price.HasValue) myProduct.Price = product.Price.Value;
                if (!string.IsNullOrWhiteSpace(product.CategoryName)) myProduct.CategoryName = product.CategoryName.Trim();
                if (!string.IsNullOrWhiteSpace(product.Fit)) myProduct.Fit = product.Fit.Trim();
                if (product.Price.HasValue) myProduct.PriceRange = DeterminePriceRange(product.Price.Value);
                if (!string.IsNullOrWhiteSpace(product.ImageFile)) myProduct.ImageFile = product.ImageFile;

                // Update sizes if provided
                if (product.Sizes != null && product.Sizes.Any())
                {
                    // Remove sizes that are no longer associated
                    var sizesToRemove = myProduct.ProductSizes
                        .Where(ps => !product.Sizes.Any(s => s.SizeName == ps.Size.Name))
                        .ToList();
                    _context.ProductSizes.RemoveRange(sizesToRemove);

                    foreach (var sizeRequest in product.Sizes)
                    {
                        var existingSize = myProduct.ProductSizes
                            .FirstOrDefault(ps => ps.Size.Name == sizeRequest.SizeName);

                        if (existingSize != null)
                        {
                            existingSize.StockQuantity = sizeRequest.StockQuantity;
                        }
                        else
                        {
                            var size = await _context.Sizes.FirstOrDefaultAsync(s => s.Name == sizeRequest.SizeName)
                                       ?? new Size { Name = sizeRequest.SizeName };

                            if (size.Id == 0)
                            {
                                await _context.Sizes.AddAsync(size);
                                await _context.SaveChangesAsync();
                            }

                            var newProductSize = new ProductSize
                            {
                                ProductId = myProduct.Id,
                                SizeId = size.Id,
                                StockQuantity = sizeRequest.StockQuantity
                            };

                            await _context.ProductSizes.AddAsync(newProductSize);
                        }
                    }
                }

                // Update colors if provided
                if (product.Colors != null && product.Colors.Any())
                {
                    var colorsToRemove = myProduct.ProductColors
                        .Where(pc => !product.Colors.Contains(pc.Color.Name))
                        .ToList();
                    _context.ProductColors.RemoveRange(colorsToRemove);

                    foreach (var colorName in product.Colors)
                    {
                        var existingColor = myProduct.ProductColors
                            .FirstOrDefault(pc => pc.Color.Name == colorName);

                        if (existingColor == null)
                        {
                            var color = await _context.Colors.FirstOrDefaultAsync(c => c.Name == colorName)
                                        ?? new Color { Name = colorName };

                            if (color.Id == 0)
                            {
                                await _context.Colors.AddAsync(color);
                                await _context.SaveChangesAsync();
                            }

                            var productColor = new ProductColor
                            {
                                ProductId = myProduct.Id,
                                ColorId = color.Id
                            };

                            await _context.ProductColors.AddAsync(productColor);
                        }
                    }
                }

                // Recalculate total stock quantity
                myProduct.StockQuantity = myProduct.ProductSizes.Sum(ps => ps.StockQuantity);

                myProduct.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product {ProductId} updated successfully by user {UserId}", id, userId);
                return Ok(new { Message = "Product updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId}", id);
                return StatusCode(500, new
                {
                    Message = "An error occurred while updating the product.",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }


        [HttpDelete("{id}"), Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var myProduct = await _context.Products.FindAsync(id);
                if (myProduct == null)
                {
                    return NotFound("Product not found.");
                }

                int userId = GetUserId();
                if (myProduct.UserId != userId)
                {
                    return Forbid("You are not authorized to delete this product.");
                }

                _context.Products.Remove(myProduct);
                await _context.SaveChangesAsync();
                return Ok("Product deleted successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error when deleting product with ID {id}");
                return StatusCode(500, new
                {
                    Message = "An error occurred while deleting the product.",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
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
    }
}
