namespace MedicineInventory.Api.Models;

public class Sale
{
    public int Id { get; set; }
    public int MedicineId { get; set; }
    public int QuantitySold { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;

    public Medicine? Medicine { get; set; }
}
