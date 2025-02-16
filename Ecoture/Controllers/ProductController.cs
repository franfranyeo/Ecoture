using AutoMapper;
using Ecoture.Model.Entity;
using Ecoture.Model.Request;
using Ecoture.Model.Enum;
using Ecoture.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Ecoture.Model.Response;

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
                // ✅ Start query with necessary includes
                IQueryable<Product> query = _context.Products
                    .AsNoTracking()
                    .Include(p => p.User)
                    .Include(p => p.ProductSizeColors)
                        .ThenInclude(psc => psc.Size)
                    .Include(p => p.ProductSizeColors)
                        .ThenInclude(psc => psc.Color)
                    .Include(p => p.ProductFits)
                        .ThenInclude(pf => pf.Fit)
                    .Include(p => p.ProductCategories)
                        .ThenInclude(pc => pc.Category);

                // ✅ Apply search filtering (case-insensitive)
                if (!string.IsNullOrWhiteSpace(search))
                {
                    string searchLower = search.ToLower();
                    query = query.Where(p => p.Title.ToLower().Contains(searchLower) ||
                                             p.Description.ToLower().Contains(searchLower));
                }

                // ✅ Apply category filtering (supports multiple categories)
                if (!string.IsNullOrWhiteSpace(category))
                {
                    var categoryList = category.Split(',').Select(c => c.Trim().ToLower()).ToList();
                    query = query.Where(p => p.ProductCategories.Any(pc => categoryList.Contains(pc.Category.Name.ToLower())));
                }

                // ✅ Fetch the filtered data
                var products = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

                // ✅ Map to DTOs and return result
                var productDTOs = _mapper.Map<List<ProductDTO>>(products);
                return Ok(productDTOs);
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
                // ✅ Fetch the product with related data (without tracking)
                var product = await _context.Products
                    .AsNoTracking()
                    .Include(p => p.User)
                    .Include(p => p.ProductSizeColors)
                        .ThenInclude(psc => psc.Size)
                    .Include(p => p.ProductSizeColors)
                        .ThenInclude(psc => psc.Color)
                    .Include(p => p.ProductFits)
                        .ThenInclude(pf => pf.Fit)
                    .Include(p => p.ProductCategories)
                        .ThenInclude(pc => pc.Category)
                    .FirstOrDefaultAsync(p => p.Id == id);

                // ✅ If product does not exist, return 404
                if (product == null)
                {
                    return NotFound(new { Message = $"Product with ID {id} not found." });
                }

                // ✅ Convert to DTO
                var productDTO = _mapper.Map<ProductDTO>(product);

                return Ok(productDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving product with ID {id}");
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
            if (product.SizeColors == null || !product.SizeColors.Any())
            {
                return BadRequest(new { Message = "At least one size-color combination must be provided." });
            }

            if (product.Categories == null || !product.Categories.Any())
            {
                return BadRequest(new { Message = "At least one category must be provided." });
            }

            if (product.Fits == null || !product.Fits.Any())
            {
                return BadRequest(new { Message = "At least one fit must be provided." });
            }

            int userId = GetUserId(); // Get authenticated user ID
            var now = DateTime.UtcNow;
            var calculatedPriceRange = DeterminePriceRange(product.Price);

            // ✅ Step 1: Create Product (WITH StockQuantity Calculation)
            var myProduct = new Product
            {
                Title = product.Title.Trim(),
                Description = product.Description.Trim(),
                LongDescription = product.LongDescription.Trim(),
                Price = product.Price,
                PriceRange = calculatedPriceRange,
                ImageFile = product.ImageFile ?? string.Empty,
                CreatedAt = now,
                UpdatedAt = now,
                UserId = userId,
                StockQuantity = product.SizeColors.Sum(sc => sc.StockQuantity) // ✅ Compute StockQuantity
            };

            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync(); // ✅ Ensure atomicity

                await _context.Products.AddAsync(myProduct);
                await _context.SaveChangesAsync(); // ✅ Ensure Product ID is generated

                // ✅ Step 2: Process Sizes & Colors
                var existingSizes = await _context.Sizes.ToListAsync();
                var existingColors = await _context.Colors.ToListAsync();
                var productSizeColors = new List<ProductSizeColor>();

                foreach (var sizeColorRequest in product.SizeColors)
                {
                    var size = existingSizes.FirstOrDefault(s => s.Name == sizeColorRequest.SizeName)
                                ?? new Size { Name = sizeColorRequest.SizeName };

                    if (size.Id == 0) _context.Sizes.Add(size);

                    var color = existingColors.FirstOrDefault(c => c.Name == sizeColorRequest.ColorName)
                                ?? new Color { Name = sizeColorRequest.ColorName };

                    if (color.Id == 0) _context.Colors.Add(color);

                    await _context.SaveChangesAsync(); // ✅ Save new sizes & colors before linking

                    productSizeColors.Add(new ProductSizeColor
                    {
                        ProductId = myProduct.Id,
                        SizeId = size.Id,
                        ColorId = color.Id,
                        StockQuantity = sizeColorRequest.StockQuantity
                    });
                }

                await _context.ProductSizeColors.AddRangeAsync(productSizeColors);

                // ✅ Step 3: Process Categories
                var existingCategories = await _context.Categories.ToListAsync();
                var productCategories = new List<ProductCategory>();

                foreach (var categoryName in product.Categories)
                {
                    var category = existingCategories.FirstOrDefault(c => c.Name == categoryName)
                                    ?? new Category { Name = categoryName };

                    if (category.Id == 0) _context.Categories.Add(category);

                    await _context.SaveChangesAsync(); // ✅ Save new category before linking

                    productCategories.Add(new ProductCategory
                    {
                        ProductId = myProduct.Id,
                        CategoryId = category.Id
                    });
                }

                await _context.ProductCategories.AddRangeAsync(productCategories);

                // ✅ Step 4: Process Fits
                var existingFits = await _context.Fits.ToListAsync();
                var productFits = new List<ProductFit>();

                foreach (var fitName in product.Fits)
                {
                    var fit = existingFits.FirstOrDefault(f => f.Name == fitName)
                                ?? new Fit { Name = fitName };

                    if (fit.Id == 0) _context.Fits.Add(fit);

                    await _context.SaveChangesAsync(); // ✅ Save new fit before linking

                    productFits.Add(new ProductFit
                    {
                        ProductId = myProduct.Id,
                        FitId = fit.Id
                    });
                }

                await _context.ProductFits.AddRangeAsync(productFits);

                await _context.SaveChangesAsync(); // ✅ Final save
                await transaction.CommitAsync();  // ✅ Commit transaction

                // ✅ Fetch product with all related data (for response)
                var newProduct = await _context.Products
                    .Include(p => p.User)
                    .Include(p => p.ProductSizeColors).ThenInclude(psc => psc.Size)
                    .Include(p => p.ProductSizeColors).ThenInclude(psc => psc.Color)
                    .Include(p => p.ProductFits).ThenInclude(pf => pf.Fit)
                    .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == myProduct.Id);

                var productDTO = _mapper.Map<ProductDTO>(newProduct);
                return Ok(productDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding product");

                await _context.Database.RollbackTransactionAsync(); // ✅ Rollback in case of error

                return StatusCode(500, new
                {
                    Message = "An error occurred while adding the product.",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }






        [HttpPut("{id}"), Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest product)
        {
            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync(); // ✅ Ensure atomicity

                var myProduct = await _context.Products
                    .Include(p => p.ProductSizeColors).ThenInclude(psc => psc.Size)
                    .Include(p => p.ProductSizeColors).ThenInclude(psc => psc.Color)
                    .Include(p => p.ProductFits).ThenInclude(pf => pf.Fit)
                    .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (myProduct == null)
                {
                    return NotFound(new { Message = "Product not found." });
                }

                int userId = GetUserId();
                if (myProduct.UserId != userId)
                {
                    return Forbid();
                }

                // ✅ Step 1: Update Product Properties
                if (!string.IsNullOrWhiteSpace(product.Title)) myProduct.Title = product.Title.Trim();
                if (!string.IsNullOrWhiteSpace(product.Description)) myProduct.Description = product.Description.Trim();
                if (!string.IsNullOrWhiteSpace(product.LongDescription)) myProduct.LongDescription = product.LongDescription.Trim();
                if (product.Price.HasValue)
                {
                    myProduct.Price = product.Price.Value;
                    myProduct.PriceRange = DeterminePriceRange(product.Price.Value);
                }
                if (!string.IsNullOrWhiteSpace(product.ImageFile)) myProduct.ImageFile = product.ImageFile;

                // ✅ Step 2: Update Size-Color Combinations & StockQuantity
                if (product.SizeColors != null && product.SizeColors.Any())
                {
                    var existingSizeColors = myProduct.ProductSizeColors.ToList();
                    var newStockQuantity = 0;

                    // **Find and remove size-color combinations not in the updated list**
                    var sizeColorsToRemove = existingSizeColors
                        .Where(psc => !product.SizeColors.Any(sc => sc.SizeName == psc.Size.Name && sc.ColorName == psc.Color.Name))
                        .ToList();
                    _context.ProductSizeColors.RemoveRange(sizeColorsToRemove);

                    var existingSizes = await _context.Sizes.ToListAsync();
                    var existingColors = await _context.Colors.ToListAsync();

                    foreach (var sizeColorRequest in product.SizeColors)
                    {
                        var size = existingSizes.FirstOrDefault(s => s.Name == sizeColorRequest.SizeName)
                                    ?? new Size { Name = sizeColorRequest.SizeName };

                        if (size.Id == 0) _context.Sizes.Add(size);

                        var color = existingColors.FirstOrDefault(c => c.Name == sizeColorRequest.ColorName)
                                    ?? new Color { Name = sizeColorRequest.ColorName };

                        if (color.Id == 0) _context.Colors.Add(color);

                        await _context.SaveChangesAsync(); // ✅ Save new sizes & colors before linking

                        var existingSizeColor = existingSizeColors
                            .FirstOrDefault(psc => psc.Size.Name == sizeColorRequest.SizeName && psc.Color.Name == sizeColorRequest.ColorName);

                        if (existingSizeColor != null)
                        {
                            existingSizeColor.StockQuantity = sizeColorRequest.StockQuantity;
                        }
                        else
                        {
                            _context.ProductSizeColors.Add(new ProductSizeColor
                            {
                                ProductId = myProduct.Id,
                                SizeId = size.Id,
                                ColorId = color.Id,
                                StockQuantity = sizeColorRequest.StockQuantity
                            });
                        }

                        // ✅ Accumulate stock quantity
                        newStockQuantity += sizeColorRequest.StockQuantity;
                    }

                    // ✅ Update StockQuantity in the Product entity
                    myProduct.StockQuantity = newStockQuantity;
                }

                // ✅ Step 3: Update Categories
                if (product.Categories != null && product.Categories.Any())
                {
                    var categoriesToRemove = myProduct.ProductCategories
                        .Where(pc => !product.Categories.Contains(pc.Category.Name))
                        .ToList();
                    _context.ProductCategories.RemoveRange(categoriesToRemove);

                    var existingCategories = await _context.Categories.ToListAsync();

                    foreach (var categoryName in product.Categories)
                    {
                        var category = existingCategories.FirstOrDefault(c => c.Name == categoryName)
                                        ?? new Category { Name = categoryName };

                        if (category.Id == 0) _context.Categories.Add(category);

                        await _context.SaveChangesAsync(); // ✅ Save new category before linking

                        if (!myProduct.ProductCategories.Any(pc => pc.Category.Name == categoryName))
                        {
                            _context.ProductCategories.Add(new ProductCategory
                            {
                                ProductId = myProduct.Id,
                                CategoryId = category.Id
                            });
                        }
                    }
                }

                // ✅ Step 4: Update Fits
                if (product.Fits != null && product.Fits.Any())
                {
                    var fitsToRemove = myProduct.ProductFits
                        .Where(pf => !product.Fits.Contains(pf.Fit.Name))
                        .ToList();
                    _context.ProductFits.RemoveRange(fitsToRemove);

                    var existingFits = await _context.Fits.ToListAsync();

                    foreach (var fitName in product.Fits)
                    {
                        var fit = existingFits.FirstOrDefault(f => f.Name == fitName)
                                    ?? new Fit { Name = fitName };

                        if (fit.Id == 0) _context.Fits.Add(fit);

                        await _context.SaveChangesAsync(); // ✅ Save new fit before linking

                        if (!myProduct.ProductFits.Any(pf => pf.Fit.Name == fitName))
                        {
                            _context.ProductFits.Add(new ProductFit
                            {
                                ProductId = myProduct.Id,
                                FitId = fit.Id
                            });
                        }
                    }
                }

                // ✅ Step 5: Update timestamps
                myProduct.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Product updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId}", id);

                await _context.Database.RollbackTransactionAsync(); // ✅ Rollback in case of error

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
                using var transaction = await _context.Database.BeginTransactionAsync(); // ✅ Ensure atomic deletion

                var myProduct = await _context.Products
                    .Include(p => p.ProductSizeColors) // ✅ Include Size-Color mappings
                    .Include(p => p.ProductFits) // ✅ Include Fits
                    .Include(p => p.ProductCategories) // ✅ Include Categories
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (myProduct == null)
                {
                    return NotFound(new { Message = "Product not found." });
                }

                int userId = GetUserId();
                if (myProduct.UserId != userId)
                {
                    return Forbid();
                }

                // ✅ Step 1: Remove related data before deleting the product
                if (myProduct.ProductSizeColors.Any())
                {
                    _context.ProductSizeColors.RemoveRange(myProduct.ProductSizeColors);
                }

                if (myProduct.ProductFits.Any())
                {
                    _context.ProductFits.RemoveRange(myProduct.ProductFits);
                }

                if (myProduct.ProductCategories.Any())
                {
                    _context.ProductCategories.RemoveRange(myProduct.ProductCategories);
                }

                // ✅ Step 2: Remove the product itself
                _context.Products.Remove(myProduct);
                await _context.SaveChangesAsync(); // ✅ Commit all changes

                await transaction.CommitAsync(); // ✅ Ensure atomic deletion

                _logger.LogInformation($"Product ID {id} deleted successfully by User ID {userId}");

                return Ok(new { Message = "Product deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error when deleting product with ID {id}");

                await _context.Database.RollbackTransactionAsync(); // ✅ Rollback in case of error

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

        [HttpPut("reduce-stock/{id}"), Authorize]
        public async Task<IActionResult> ReduceStock(int id, [FromBody] ReduceStockRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest(new { Message = "Quantity must be greater than zero." });
            }

            var product = await _context.Products
                .Include(p => p.ProductSizeColors)
                .ThenInclude(psc => psc.Size)
                .Include(p => p.ProductSizeColors)
                .ThenInclude(psc => psc.Color)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { Message = "Product not found." });
            }

            var productSizeColor = product.ProductSizeColors
                .FirstOrDefault(psc => psc.Size.Name == request.Size && psc.Color.Name == request.Color);

            if (productSizeColor == null)
            {
                return BadRequest(new { Message = "Invalid size or color selection." });
            }

            if (productSizeColor.StockQuantity < request.Quantity)
            {
                return BadRequest(new { Message = "Not enough stock available." });
            }

            // Deduct stock
            productSizeColor.StockQuantity -= request.Quantity;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Stock updated successfully." });
        }

    }
}
