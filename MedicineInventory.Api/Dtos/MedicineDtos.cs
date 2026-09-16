using System.ComponentModel.DataAnnotations;

namespace MedicineInventory.Api.Dtos;

public record MedicineDto(
    int Id,
    string Name,
    string? GenericName,
    string Category,
    int Quantity,
    decimal UnitPrice,
    DateOnly? ExpiryDate,
    string? Supplier,
    int TotalSold,
    decimal TotalRevenue,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record MedicineUpsertRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = string.Empty;

    [MaxLength(200)]
    public string? GenericName { get; init; }

    [Required]
    [MaxLength(100)]
    public string Category { get; init; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Quantity { get; init; }

    [Range(0, 9999999.99)]
    public decimal UnitPrice { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    [MaxLength(200)]
    public string? Supplier { get; init; }
}
