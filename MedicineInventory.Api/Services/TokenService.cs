using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MedicineInventory.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace MedicineInventory.Api.Services;

public interface ITokenService
{
    string CreateToken(User user);
}

public class TokenService(IConfiguration configuration) : ITokenService
{
    public string CreateToken(User user)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var key = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var expiryHours = jwtSection.GetValue("ExpiryHours", 8);

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        );

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role),
            new("displayName", user.DisplayName),
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
