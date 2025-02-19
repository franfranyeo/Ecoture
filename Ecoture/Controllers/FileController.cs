using Ecoture.Model.Response;
using Google.Protobuf.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NanoidDotNet;
using System.Security.Principal;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Ecoture.Services;


namespace Ecoture.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly CloudinaryService _cloudinaryService;
        private readonly ILogger<FileController> _logger;

        public FileController(CloudinaryService cloudinaryService, ILogger<FileController> logger)
        {
            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }

        [HttpPost("upload"), Authorize]
        [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
                if (file.Length > 1024 * 1024)
                {
                    var message = "Maximum file size is 1MB";
                    return BadRequest(new { message });
                }

                var uploadResult = await _cloudinaryService.UploadImageAsync(file);

                if (uploadResult.Error != null)
                {
                    _logger.LogError(uploadResult.Error.Message);
                    return StatusCode(500, new { message = "Error uploading image to Cloudinary" });
                }

                UploadResponse response = new() { Filename = uploadResult.SecureUrl.ToString() };
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when uploading file");
                return StatusCode(500);
            }
        }
    }

    public class UploadResponse
    {
        public string Filename { get; set; }
    }
}
