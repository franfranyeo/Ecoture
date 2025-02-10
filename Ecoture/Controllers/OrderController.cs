using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System;

using AutoMapper;
using Microsoft.Extensions.Logging;
using Ecoture.Models.Entity;
using Ecoture.Models.DTO;
using Ecoture.Models;
using Ecoture.Model.DTO;
using Mysqlx.Crud;

namespace Ecoture.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderController> _logger;

        public OrderController(MyDbContext context, IMapper mapper, ILogger<OrderController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
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

                var order = new Models.Entity.Order
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
}
