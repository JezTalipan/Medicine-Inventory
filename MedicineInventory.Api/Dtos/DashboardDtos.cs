namespace MedicineInventory.Api.Dtos;

public record SalesPointDto(string Date, decimal Revenue, int UnitsSold);

public record StockLevelDto(string Name, int Quantity);

public record TopSellingDto(string Name, int UnitsSold, decimal Revenue);

public record DashboardSummaryDto(
    int TotalMedicines,
    decimal TotalStockValue,
    decimal TotalSalesRevenue,
    int LowStockCount,
    IReadOnlyList<SalesPointDto> SalesOverTime,
    IReadOnlyList<StockLevelDto> StockLevels,
    IReadOnlyList<TopSellingDto> TopSelling
);
