using MedicineInventory.Api.Data;
using MedicineInventory.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicineInventory.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    public const int LowStockThreshold = 10;

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var totalMedicines = await db.Medicines.CountAsync();
        var totalStockValue =
            await db.Medicines.SumAsync(m => (decimal?)(m.Quantity * m.UnitPrice)) ?? 0m;
        var totalSalesRevenue = await db.Sales.SumAsync(s => (decimal?)s.TotalAmount) ?? 0m;
        var lowStockCount = await db.Medicines.CountAsync(m => m.Quantity < LowStockThreshold);

        // Grouped and aggregated in SQL; the date is formatted after materialising
        // because EF cannot translate DateTime.ToString(format).
        var since = DateTime.UtcNow.Date.AddDays(-29);
        var dailySales = await db
            .Sales.AsNoTracking()
            .Where(s => s.SaleDate >= since)
            .GroupBy(s => s.SaleDate.Date)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                Date = g.Key,
                Revenue = g.Sum(s => s.TotalAmount),
                UnitsSold = g.Sum(s => s.QuantitySold),
            })
            .ToListAsync();

        var salesOverTime = dailySales
            .Select(p => new SalesPointDto(p.Date.ToString("yyyy-MM-dd"), p.Revenue, p.UnitsSold))
            .ToList();

        var stockLevels = await db
            .Medicines.AsNoTracking()
            .OrderByDescending(m => m.Quantity)
            .Take(15)
            .Select(m => new StockLevelDto(m.Name, m.Quantity))
            .ToListAsync();

        var topSellingRows = await db
            .Sales.AsNoTracking()
            .GroupBy(s => new { s.MedicineId, s.Medicine!.Name })
            .Select(g => new
            {
                g.Key.Name,
                UnitsSold = g.Sum(s => s.QuantitySold),
                Revenue = g.Sum(s => s.TotalAmount),
            })
            .OrderByDescending(t => t.UnitsSold)
            .Take(5)
            .ToListAsync();

        var topSelling = topSellingRows
            .Select(t => new TopSellingDto(t.Name, t.UnitsSold, t.Revenue))
            .ToList();

        return Ok(
            new DashboardSummaryDto(
                totalMedicines,
                totalStockValue,
                totalSalesRevenue,
                lowStockCount,
                salesOverTime,
                stockLevels,
                topSelling
            )
        );
    }
}
