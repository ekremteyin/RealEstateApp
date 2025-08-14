using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using RealEstate.Application.DTO.EstatesDto;
using RealEstate.Application.Interfaces;
namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstateController : ControllerBase
    {
        private readonly IEstateService _estateService;

        public EstateController(IEstateService estateService)
        {
            _estateService = estateService;
        }


        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var result = await _estateService.GetAllEstate();
            return Ok(result);
        }

        
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _estateService.GetByIdEstate(id);
            if (result == null)
                return NotFound("İlan bulunamadı.");
            return Ok(result);
        }

        
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddEstate([FromBody] CreateEstateDto createEstateDto)
        {
            var newId = await _estateService.CreateEstate(createEstateDto);
            return Ok(new { id = newId, message = "İlan başarıyla eklendi." });
        }

        
        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateEstate([FromBody] UpdateEstateDto updateEstateDto)
        {
            var value = await _estateService.UpdateEstate(updateEstateDto);
            if (!value)
                return NotFound("Güncellenecek ilan bulunamadı.");
            return Ok("Güncelleme başarılı.");
        }

        
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEstate(int id)
        {
            var result = await _estateService.DeleteEstate(id);
            if (!result)
                return NotFound("Silinecek ilan bulunamadı.");
            return Ok("Silme işlemi başarılı.");
        }
    }
}
