using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Threading.Tasks;

using AutoMapper;
using Microsoft.Extensions.Logging;
using Ecoture.Model.Entity;
using Ecoture.Model.DTO;
using Ecoture.Services;

namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderController> _logger;
        private readonly IEmailService _emailService;

        public OrderController(MyDbContext context, IMapper mapper, ILogger<OrderController> logger, IEmailService emailService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _emailService = emailService;
        }

        // ✅ Place a new order
        [HttpPost, Authorize]
        public IActionResult PlaceOrder([FromBody] List<CartDTO> selectedCartItems)
        {
            try
            {
                int userId = GetUserId();

                if (selectedCartItems == null || selectedCartItems.Count == 0)
                {
                    return BadRequest(new { message = "No items selected." });
                }

                decimal totalPrice = selectedCartItems.Sum(item => item.Price * item.Quantity);

                var order = new Model.Entity.Order
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    TotalPrice = totalPrice,
                    OrderItems = selectedCartItems.Select(item => new OrderItem
                    {
                        ProductId = item.ProductId,
                        ProductTitle = item.ProductTitle,
                        Price = item.Price,
                        Color = item.Color,
                        Size = item.Size,
                        Quantity = item.Quantity,
                        ImageFile = item.ImageFile
                    }).ToList()
                };

                _context.Orders.Add(order);
                _context.SaveChanges();

                return Ok(new { message = "Order placed successfully!", orderId = order.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when placing order");
                return StatusCode(500, new { message = "Internal server error while placing order." });
            }
        }

        // ✅ Order Confirmation Email
        [HttpPost("confirm"), Authorize]
        public async Task<IActionResult> ConfirmOrder([FromBody] OrderConfirmationRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null) return NotFound(new { message = "User not found." });

            var latestOrder = await _context.Orders
                .Where(o => o.UserId == request.UserId)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (latestOrder == null) return NotFound(new { message = "No recent order found." });

            // ✅ Send Order Confirmation Email
            string emailBody = $@"
                <html>
                <body>
                    <h2>Order Confirmation</h2>
                    <p>Dear {user.FirstName},</p>
                    <p>Thank you for your order! Your order (ID: {latestOrder.Id}) has been successfully placed.</p>
                    <p>Total Amount: <strong>${latestOrder.TotalPrice:F2}</strong></p>
                    <p>We will notify you once your order is shipped.</p>
                    <br>
                    <p>Best Regards,<br>Ecoture Team</p>
                </body>
                </html>
            ";

            await _emailService.SendAsync(
                user.Email,
                "Your Order Has Been Confirmed!",
                emailBody
            );

            return Ok(new { message = "Order confirmed and email sent!" });
        }

        // ✅ Get Order Details using DTO and AutoMapper
        [HttpGet("{orderId}"), Authorize]
        [ProducesResponseType(typeof(OrderDTO), StatusCodes.Status200OK)]
        public IActionResult GetOrderDetails(int orderId)
        {
            try
            {
                int userId = GetUserId();

                var order = _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefault(o => o.Id == orderId && o.UserId == userId);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found." });
                }

                OrderDTO orderDto = _mapper.Map<OrderDTO>(order);
                return Ok(orderDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order details");
                return StatusCode(500, new { message = "Error fetching order details." });
            }
        }

        // ✅ Get the Latest Order for the Authenticated User
        [HttpGet("latest"), Authorize]
        [ProducesResponseType(typeof(OrderDTO), StatusCodes.Status200OK)]
        public IActionResult GetLatestOrder()
        {
            try
            {
                int userId = GetUserId();

                var latestOrder = _context.Orders
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .Include(o => o.OrderItems)
                    .FirstOrDefault();

                if (latestOrder == null)
                {
                    return NotFound(new { message = "No orders found for the user." });
                }

                OrderDTO latestOrderDto = _mapper.Map<OrderDTO>(latestOrder);
                return Ok(latestOrderDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching latest order");
                return StatusCode(500, new { message = "Error retrieving latest order." });
            }
        }

        // ✅ Get all orders for a user (returns a list of DTOs)
        [HttpGet, Authorize]
        [ProducesResponseType(typeof(IEnumerable<OrderDTO>), StatusCodes.Status200OK)]
        public IActionResult GetUserOrders()
        {
            try
            {
                int userId = GetUserId();

                var orders = _context.Orders
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .Include(o => o.OrderItems)
                    .ToList();

                if (!orders.Any())
                {
                    return NotFound(new { message = "No orders found for the user." });
                }

                var orderDtos = orders.Select(_mapper.Map<OrderDTO>);
                return Ok(orderDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user orders");
                return StatusCode(500, new { message = "Error fetching user orders." });
            }
        }

        // ✅ Helper method to get authenticated user ID
        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        }
    }

    // ✅ Order Confirmation Request DTO
    public class OrderConfirmationRequest
    {
        public int UserId { get; set; }
    }
}
