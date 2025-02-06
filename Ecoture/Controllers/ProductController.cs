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
        public async Task<IActionResult> GetAll(string? search, string? category)
        {
            try
            {
                IQueryable<Product> query = _context.Products
                    .Include(t => t.User)
                    .Include(t => t.ProductSizes)
                        .ThenInclude(ps => ps.Size)
                    .Include(p => p.ProductColors)
                        .ThenInclude(pc => pc.Color)
                    .Include(p => p.ProductFits)
                        .ThenInclude(pf => pf.Fit)
                    .Include(p => p.ProductCategories)
                        .ThenInclude(pc => pc.Category);

                // Apply search filtering if provided
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(x => x.Title.Contains(search) || x.Description.Contains(search));
                }

                // Apply category filtering if provided
                if (!string.IsNullOrWhiteSpace(category))
                {
                    query = query.Where(p => p.ProductCategories.Any(pc => pc.Category.Name == category));
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
                    .Include(p => p.ProductFits) // ✅ Include ProductFits relationship
                        .ThenInclude(pf => pf.Fit) // ✅ Include related Fit data
                    .Include(p => p.ProductCategories) // ✅ Include ProductCategories relationship
                        .ThenInclude(pc => pc.Category) // ✅ Include related Category data
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
            if (product.Sizes == null || !product.Sizes.Any())
            {
                return BadRequest("At least one size must be provided.");
            }

            if (product.Colors == null || !product.Colors.Any())
            {
                return BadRequest("At least one color must be provided.");
            }

            if (product.Categories == null || !product.Categories.Any())
            {
                return BadRequest("At least one category must be provided.");
            }

            if (product.Fits == null || !product.Fits.Any())
            {
                return BadRequest("At least one fit must be provided.");
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
                PriceRange = calculatedPriceRange,
                ImageFile = product.ImageFile ?? string.Empty,
                CreatedAt = now,
                UpdatedAt = now,
                UserId = userId
            };

            // **Step 1: Save Product First**
            await _context.Products.AddAsync(myProduct);
            await _context.SaveChangesAsync(); // Ensures Product ID is generated

            // **Step 2: Add Sizes**
            foreach (var sizeRequest in product.Sizes)
            {
                var size = await _context.Sizes.FirstOrDefaultAsync(s => s.Name == sizeRequest.SizeName)
                            ?? new Size { Name = sizeRequest.SizeName };

                if (size.Id == 0)
                {
                    _context.Sizes.Add(size);
                    await _context.SaveChangesAsync(); // Save new size if it was added
                }

                var newProductSize = new ProductSize
                {
                    ProductId = myProduct.Id,
                    SizeId = size.Id,
                    StockQuantity = sizeRequest.StockQuantity
                };

                _context.ProductSizes.Add(newProductSize);
            }

            // **Step 3: Add Colors**
            foreach (var colorName in product.Colors)
            {
                var color = await _context.Colors.FirstOrDefaultAsync(c => c.Name == colorName)
                            ?? new Color { Name = colorName };

                if (color.Id == 0)
                {
                    _context.Colors.Add(color);
                    await _context.SaveChangesAsync(); // Save new color if it was added
                }

                var newProductColor = new ProductColor
                {
                    ProductId = myProduct.Id,
                    ColorId = color.Id
                };

                _context.ProductColors.Add(newProductColor);
            }

            // **Step 4: Add Categories**
            foreach (var categoryName in product.Categories)
            {
                var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == categoryName)
                                ?? new Category { Name = categoryName };

                if (category.Id == 0)
                {
                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync(); // Save new category if it was added
                }

                var newProductCategory = new ProductCategory
                {
                    ProductId = myProduct.Id,
                    CategoryId = category.Id
                };

                _context.ProductCategories.Add(newProductCategory);
            }

            // **Step 5: Add Fits**
            foreach (var fitName in product.Fits)
            {
                var fit = await _context.Fits.FirstOrDefaultAsync(f => f.Name == fitName)
                          ?? new Fit { Name = fitName };

                if (fit.Id == 0)
                {
                    _context.Fits.Add(fit);
                    await _context.SaveChangesAsync(); // Save new fit if it was added
                }

                var newProductFit = new ProductFit
                {
                    ProductId = myProduct.Id,
                    FitId = fit.Id
                };

                _context.ProductFits.Add(newProductFit);
            }

            await _context.SaveChangesAsync(); // Final save for sizes, colors, categories, and fits

            var newProduct = await _context.Products
                .Include(p => p.User)
                .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                .Include(p => p.ProductFits).ThenInclude(pf => pf.Fit) // ✅ Include Fits
                .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category) // ✅ Include Categories
                .FirstOrDefaultAsync(p => p.Id == myProduct.Id);

            var productDTO = _mapper.Map<ProductDTO>(newProduct);
            return Ok(productDTO);
        }



        [HttpPut("{id}"), Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest product)
        {
            try
            {
                var myProduct = await _context.Products
                    .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                    .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                    .Include(p => p.ProductFits).ThenInclude(pf => pf.Fit) // ✅ Include Fits
                    .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category) // ✅ Include Categories
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

                // **Update product properties**
                if (!string.IsNullOrWhiteSpace(product.Title)) myProduct.Title = product.Title.Trim();
                if (!string.IsNullOrWhiteSpace(product.Description)) myProduct.Description = product.Description.Trim();
                if (!string.IsNullOrWhiteSpace(product.LongDescription)) myProduct.LongDescription = product.LongDescription.Trim();
                if (product.Price.HasValue) myProduct.Price = product.Price.Value;
                if (product.Price.HasValue) myProduct.PriceRange = DeterminePriceRange(product.Price.Value);
                if (!string.IsNullOrWhiteSpace(product.ImageFile)) myProduct.ImageFile = product.ImageFile;

                // **Update Sizes**
                if (product.Sizes != null && product.Sizes.Any())
                {
                    var sizesToRemove = myProduct.ProductSizes
                        .Where(ps => !product.Sizes.Any(s => s.SizeName == ps.Size.Name))
                        .ToList();
                    _context.ProductSizes.RemoveRange(sizesToRemove);

                    foreach (var sizeRequest in product.Sizes)
                    {
                        var size = await _context.Sizes.FirstOrDefaultAsync(s => s.Name == sizeRequest.SizeName)
                                    ?? new Size { Name = sizeRequest.SizeName };

                        if (size.Id == 0)
                        {
                            _context.Sizes.Add(size);
                            await _context.SaveChangesAsync(); // Save new size if added
                        }

                        var existingSize = myProduct.ProductSizes
                            .FirstOrDefault(ps => ps.Size.Name == sizeRequest.SizeName);

                        if (existingSize != null)
                        {
                            existingSize.StockQuantity = sizeRequest.StockQuantity;
                        }
                        else
                        {
                            var newProductSize = new ProductSize
                            {
                                ProductId = myProduct.Id,
                                SizeId = size.Id,
                                StockQuantity = sizeRequest.StockQuantity
                            };

                            _context.ProductSizes.Add(newProductSize);
                        }
                    }
                }

                // **Update Colors**
                if (product.Colors != null && product.Colors.Any())
                {
                    var colorsToRemove = myProduct.ProductColors
                        .Where(pc => !product.Colors.Contains(pc.Color.Name))
                        .ToList();
                    _context.ProductColors.RemoveRange(colorsToRemove);

                    foreach (var colorName in product.Colors)
                    {
                        var color = await _context.Colors.FirstOrDefaultAsync(c => c.Name == colorName)
                                    ?? new Color { Name = colorName };

                        if (color.Id == 0)
                        {
                            _context.Colors.Add(color);
                            await _context.SaveChangesAsync(); // Save new color if added
                        }

                        var existingColor = myProduct.ProductColors
                            .FirstOrDefault(pc => pc.Color.Name == colorName);

                        if (existingColor == null)
                        {
                            var productColor = new ProductColor
                            {
                                ProductId = myProduct.Id,
                                ColorId = color.Id
                            };

                            _context.ProductColors.Add(productColor);
                        }
                    }
                }

                // **Update Categories**
                if (product.Categories != null && product.Categories.Any())
                {
                    var categoriesToRemove = myProduct.ProductCategories
                        .Where(pc => !product.Categories.Contains(pc.Category.Name))
                        .ToList();
                    _context.ProductCategories.RemoveRange(categoriesToRemove);

                    foreach (var categoryName in product.Categories)
                    {
                        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == categoryName)
                                        ?? new Category { Name = categoryName };

                        if (category.Id == 0)
                        {
                            _context.Categories.Add(category);
                            await _context.SaveChangesAsync(); // Save new category if added
                        }

                        if (!myProduct.ProductCategories.Any(pc => pc.Category.Name == categoryName))
                        {
                            var productCategory = new ProductCategory
                            {
                                ProductId = myProduct.Id,
                                CategoryId = category.Id
                            };

                            _context.ProductCategories.Add(productCategory);
                        }
                    }
                }

                // **Update Fits**
                if (product.Fits != null && product.Fits.Any())
                {
                    var fitsToRemove = myProduct.ProductFits
                        .Where(pf => !product.Fits.Contains(pf.Fit.Name))
                        .ToList();
                    _context.ProductFits.RemoveRange(fitsToRemove);

                    foreach (var fitName in product.Fits)
                    {
                        var fit = await _context.Fits.FirstOrDefaultAsync(f => f.Name == fitName)
                                  ?? new Fit { Name = fitName };

                        if (fit.Id == 0)
                        {
                            _context.Fits.Add(fit);
                            await _context.SaveChangesAsync(); // Save new fit if added
                        }

                        if (!myProduct.ProductFits.Any(pf => pf.Fit.Name == fitName))
                        {
                            var productFit = new ProductFit
                            {
                                ProductId = myProduct.Id,
                                FitId = fit.Id
                            };

                            _context.ProductFits.Add(productFit);
                        }
                    }
                }

                // **Recalculate stock quantity and update timestamps**
                myProduct.StockQuantity = myProduct.ProductSizes.Sum(ps => ps.StockQuantity);
                myProduct.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

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
                var myProduct = await _context.Products
                    .Include(p => p.ProductSizes)
                    .Include(p => p.ProductColors)
                    .Include(p => p.ProductFits) // ✅ Include Fits
                    .Include(p => p.ProductCategories) // ✅ Include Categories
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (myProduct == null)
                {
                    return NotFound("Product not found.");
                }

                int userId = GetUserId();
                if (myProduct.UserId != userId)
                {
                    return Forbid("You are not authorized to delete this product.");
                }

                // **Remove related data before deleting the product**
                _context.ProductSizes.RemoveRange(myProduct.ProductSizes);
                _context.ProductColors.RemoveRange(myProduct.ProductColors);
                _context.ProductFits.RemoveRange(myProduct.ProductFits); // ✅ Remove associated fits
                _context.ProductCategories.RemoveRange(myProduct.ProductCategories); // ✅ Remove associated categories

                // **Remove the product itself**
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
