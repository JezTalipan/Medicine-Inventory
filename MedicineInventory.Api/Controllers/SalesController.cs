using MedicineInventory.Api.Data;
using MedicineInventory.Api.Dtos;
using MedicineInventory.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicineInventory.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SalesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleDto>>> GetRecent([FromQuery] int take = 50)
    {
        take = Math.Clamp(take, 1, 500);

        var sales = await db
            .Sales.AsNoTracking()
            .OrderByDescending(s => s.SaleDate)
            .Take(take)
            .Select(s => new SaleDto(
                s.Id,
                s.MedicineId,
                s.Medicine!.Name,
                s.QuantitySold,
                s.TotalAmount,
                s.SaleDate
            ))
            .ToListAsync();

        return Ok(sales);
    }

    [HttpPost]
    public async Task<ActionResult<SaleDto>> Record(RecordSaleRequest request)
    {
        var medicine = await db.Medicines.SingleOrDefaultAsync(m => m.Id == request.MedicineId);
        if (medicine is null)
        {
            return NotFound(new { message = "Medicine not found." });
        }

        if (request.QuantitySold > medicine.Quantity)
        {
            return BadRequest(
                new { message = $"Only {medicine.Quantity} unit(s) of {medicine.Name} are in stock." }
            );
        }

        var sale = new Sale
        {
            MedicineId = medicine.Id,
            QuantitySold = request.QuantitySold,
            TotalAmount = request.QuantitySold * medicine.UnitPrice,
            SaleDate = DateTime.UtcNow,
        };

        medicine.Quantity -= request.QuantitySold;
        medicine.UpdatedAt = DateTime.UtcNow;
        db.Sales.Add(sale);

        await db.SaveChangesAsync();

        return Ok(
            new SaleDto(
                sale.Id,
                sale.MedicineId,
                medicine.Name,
                sale.QuantitySold,
                sale.TotalAmount,
                sale.SaleDate
            )
        );
    }
}
