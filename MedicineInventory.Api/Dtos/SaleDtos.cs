using System.ComponentModel.DataAnnotations;

namespace MedicineInventory.Api.Dtos;

public record RecordSaleRequest
{
    [Required]
    public int MedicineId { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity sold must be at least 1.")]
    public int QuantitySold { get; init; }
}

public record SaleDto(
    int Id,
    int MedicineId,
    string MedicineName,
    int QuantitySold,
    decimal TotalAmount,
    DateTime SaleDate
);
