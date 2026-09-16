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
public class MedicinesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicineDto>>> GetAll()
    {
        var medicines = await db
            .Medicines.AsNoTracking()
            .OrderBy(m => m.Name)
            .Select(m => new MedicineDto(
                m.Id,
                m.Name,
                m.GenericName,
                m.Category,
                m.Quantity,
                m.UnitPrice,
                m.ExpiryDate,
                m.Supplier,
                m.Sales.Sum(s => (int?)s.QuantitySold) ?? 0,
                m.Sales.Sum(s => (decimal?)s.TotalAmount) ?? 0m,
                m.CreatedAt,
                m.UpdatedAt
            ))
            .ToListAsync();

        return Ok(medicines);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MedicineDto>> GetById(int id)
    {
        var medicine = await db
            .Medicines.AsNoTracking()
            .Where(m => m.Id == id)
            .Select(m => new MedicineDto(
                m.Id,
                m.Name,
                m.GenericName,
                m.Category,
                m.Quantity,
                m.UnitPrice,
                m.ExpiryDate,
                m.Supplier,
                m.Sales.Sum(s => (int?)s.QuantitySold) ?? 0,
                m.Sales.Sum(s => (decimal?)s.TotalAmount) ?? 0m,
                m.CreatedAt,
                m.UpdatedAt
            ))
            .SingleOrDefaultAsync();

        return medicine is null ? NotFound() : Ok(medicine);
    }

    [HttpPost]
    public async Task<ActionResult<MedicineDto>> Create(MedicineUpsertRequest request)
    {
        var now = DateTime.UtcNow;
        var medicine = new Medicine
        {
            Name = request.Name,
            GenericName = request.GenericName,
            Category = request.Category,
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            ExpiryDate = request.ExpiryDate,
            Supplier = request.Supplier,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Medicines.Add(medicine);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = medicine.Id }, ToDto(medicine, 0, 0m));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<MedicineDto>> Update(int id, MedicineUpsertRequest request)
    {
        var medicine = await db.Medicines.SingleOrDefaultAsync(m => m.Id == id);
        if (medicine is null)
        {
            return NotFound();
        }

        medicine.Name = request.Name;
        medicine.GenericName = request.GenericName;
        medicine.Category = request.Category;
        medicine.Quantity = request.Quantity;
        medicine.UnitPrice = request.UnitPrice;
        medicine.ExpiryDate = request.ExpiryDate;
        medicine.Supplier = request.Supplier;
        medicine.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var totalSold = await db.Sales.Where(s => s.MedicineId == id).SumAsync(s => (int?)s.QuantitySold) ?? 0;
        var totalRevenue =
            await db.Sales.Where(s => s.MedicineId == id).SumAsync(s => (decimal?)s.TotalAmount) ?? 0m;

        return Ok(ToDto(medicine, totalSold, totalRevenue));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var medicine = await db.Medicines.SingleOrDefaultAsync(m => m.Id == id);
        if (medicine is null)
        {
            return NotFound();
        }

        db.Medicines.Remove(medicine);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static MedicineDto ToDto(Medicine m, int totalSold, decimal totalRevenue) =>
        new(
            m.Id,
            m.Name,
            m.GenericName,
            m.Category,
            m.Quantity,
            m.UnitPrice,
            m.ExpiryDate,
            m.Supplier,
            totalSold,
            totalRevenue,
            m.CreatedAt,
            m.UpdatedAt
        );
}
