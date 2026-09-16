using MedicineInventory.Api.Data;
using MedicineInventory.Api.Dtos;
using MedicineInventory.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicineInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, ITokenService tokenService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var token = tokenService.CreateToken(user);
        return Ok(new LoginResponse(token, user.Username, user.DisplayName, user.Role));
    }
}
