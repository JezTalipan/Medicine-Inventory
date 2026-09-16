using System.ComponentModel.DataAnnotations;

namespace MedicineInventory.Api.Dtos;

public record LoginRequest
{
    [Required]
    public string Username { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}

public record LoginResponse(string Token, string Username, string DisplayName, string Role);
