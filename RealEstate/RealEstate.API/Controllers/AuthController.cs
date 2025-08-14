using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RealEstate.API.Services;
using RealEstate.Application.DTO.Auth;
using RealEstate.Infrastructure.Identity;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _config;

        public AuthController(UserManager<AppUser> userManager,
                              SignInManager<AppUser> signInManager,
                              ITokenService tokenService,
                              IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _config = config;
        }

        
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var user = new AppUser
            {
                UserName = dto.UserName
            };

            var create = await _userManager.CreateAsync(user, dto.Password);
            if (!create.Succeeded)
                return BadRequest(create.Errors);

            await _userManager.AddToRoleAsync(user, "User");
            return Ok("Registered");
        }

        
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UserName);
            if (user == null)
                return Unauthorized("Kullanıcı bulunamadı.");

            var pw = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!pw.Succeeded)
                return Unauthorized("Şifre hatalı.");

            var roles = await _userManager.GetRolesAsync(user);
            var token = await _tokenService.CreateTokenAsync(user, roles, _config["Jwt:Key"]!);

            return Ok(new { accessToken = token, roles });
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                userName = User.Identity?.Name,
                roles = User.Claims
                    .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList()
            });
        }
    }
}
