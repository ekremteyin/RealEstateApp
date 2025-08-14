using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using RealEstate.Infrastructure.Identity;

namespace RealEstate.API.Services
{
    public interface ITokenService
    {
        Task<string> CreateTokenAsync(AppUser user, IEnumerable<string> roles, string secretKey, int minutes = 30);
    }

    public class TokenService : ITokenService
    {
        public Task<string> CreateTokenAsync(AppUser user, IEnumerable<string> roles, string secretKey, int minutes = 30)
        {
            // 1) Claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty)
            };
            foreach (var r in roles)
                claims.Add(new Claim(ClaimTypes.Role, r));

            // 2) Signing
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 3) Token
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(minutes),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return Task.FromResult(jwt);
        }
    }
}
