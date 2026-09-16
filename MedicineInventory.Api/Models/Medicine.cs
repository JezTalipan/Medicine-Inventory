namespace MedicineInventory.Api.Models;

public class Medicine
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public string? Supplier { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
