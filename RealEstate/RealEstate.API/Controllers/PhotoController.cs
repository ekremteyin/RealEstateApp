using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTO.PhotosDto;
using RealEstate.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace RealEstate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhotoController : ControllerBase
    {
        private readonly IPhotoService _photoService;
        private readonly IWebHostEnvironment _env;

        public PhotoController(IPhotoService photoService, IWebHostEnvironment env)
        {
            _photoService = photoService;
            _env = env;
        }

       
        public sealed class AddPhotoFileDto
        {
            [FromForm] public int RealEstateId { get; set; }
            [FromForm] public IFormFile File { get; set; } = default!;
        }

        [HttpPost("file")]
        [Authorize]
        [RequestSizeLimit(10_000_000)] 
        public async Task<IActionResult> Upload([FromForm] AddPhotoFileDto dto, CancellationToken ct)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("File is empty.");
            if (!dto.File.ContentType.StartsWith("image/"))
                return BadRequest("Only images allowed.");

            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var ext = Path.GetExtension(dto.File.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest("Unsupported file type.");

            
            var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadsRoot = Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadsRoot);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var physicalPath = Path.Combine(uploadsRoot, fileName);

            await using (var fs = new FileStream(physicalPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                await dto.File.CopyToAsync(fs, ct);
            }

            
            var url = $"/uploads/{fileName}";

            
            var newId = await _photoService.AddPhotoAsync(new CreatePhotoDto
            {
                RealEstateId = dto.RealEstateId,
                ImageUrl = url
            });

            return Ok(new { Id = newId, ImageUrl = url, Message = "Fotoğraf başarıyla yüklendi" });
        }
        


        [HttpGet("estate/{estateId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPhotosByEstateId(int estateId)
        {
            var photos = await _photoService.GetPhotosByEstateIdAsync(estateId);
            return Ok(photos);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPhotoById(int id)
        {
            var photo = await _photoService.GetPhotoByIdAsync(id);
            if (photo == null)
                return NotFound(new { message = $"Fotoğraf  bulunamadı" });
            return Ok(photo);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            
            var photo = await _photoService.GetPhotoByIdAsync(id);
            if (photo == null)
                return NotFound(new { message = $"Fotoğraf bulunamadı" });

            if (!string.IsNullOrWhiteSpace(photo.ImageUrl) && photo.ImageUrl.StartsWith("/uploads/"))
            {
                var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
                var path = photo.ImageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                var full = Path.Combine(webRoot, path);
                if (System.IO.File.Exists(full)) System.IO.File.Delete(full);
            }

            var deleted = await _photoService.DeletePhotoAsync(id);
            if (!deleted)
                return NotFound(new { message = $"Fotoğraf bulunamadı" });

            return Ok("Fotoğraf Başarıyla silindi");
        }
    }
}
