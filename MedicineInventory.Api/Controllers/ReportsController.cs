using ClosedXML.Excel;
using MedicineInventory.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicineInventory.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ReportsController(AppDbContext db) : ControllerBase
{
    private const string XlsxContentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    [HttpGet("medicines")]
    public async Task<IActionResult> DownloadMedicinesReport()
    {
        var medicines = await db
            .Medicines.AsNoTracking()
            .OrderBy(m => m.Name)
            .Select(m => new
            {
                m.Id,
                m.Name,
                m.GenericName,
                m.Category,
                m.Quantity,
                m.UnitPrice,
                m.ExpiryDate,
                m.Supplier,
                TotalSold = m.Sales.Sum(s => (int?)s.QuantitySold) ?? 0,
                Revenue = m.Sales.Sum(s => (decimal?)s.TotalAmount) ?? 0m,
            })
            .ToListAsync();

        var sales = await db
            .Sales.AsNoTracking()
            .OrderByDescending(s => s.SaleDate)
            .Select(s => new
            {
                s.Id,
                MedicineName = s.Medicine!.Name,
                s.QuantitySold,
                s.TotalAmount,
                s.SaleDate,
            })
            .ToListAsync();

        using var workbook = new XLWorkbook();

        var sheet = workbook.Worksheets.Add("Medicines");
        var headers = new[]
        {
            "ID",
            "Name",
            "Generic Name",
            "Category",
            "Quantity",
            "Unit Price",
            "Stock Value",
            "Units Sold",
            "Revenue",
            "Expiry Date",
            "Supplier",
        };

        for (var i = 0; i < headers.Length; i++)
        {
            sheet.Cell(1, i + 1).Value = headers[i];
        }

        var row = 2;
        foreach (var m in medicines)
        {
            sheet.Cell(row, 1).Value = m.Id;
            sheet.Cell(row, 2).Value = m.Name;
            sheet.Cell(row, 3).Value = m.GenericName ?? string.Empty;
            sheet.Cell(row, 4).Value = m.Category;
            sheet.Cell(row, 5).Value = m.Quantity;
            sheet.Cell(row, 6).Value = m.UnitPrice;
            sheet.Cell(row, 7).Value = m.Quantity * m.UnitPrice;
            sheet.Cell(row, 8).Value = m.TotalSold;
            sheet.Cell(row, 9).Value = m.Revenue;
            sheet.Cell(row, 10).Value = m.ExpiryDate?.ToString("yyyy-MM-dd") ?? string.Empty;
            sheet.Cell(row, 11).Value = m.Supplier ?? string.Empty;
            row++;
        }

        StyleSheet(sheet, headers.Length, row - 1);
        sheet.Columns(6, 7).Style.NumberFormat.Format = "#,##0.00";
        sheet.Column(9).Style.NumberFormat.Format = "#,##0.00";

        var salesSheet = workbook.Worksheets.Add("Sales");
        var salesHeaders = new[] { "ID", "Medicine", "Quantity Sold", "Total Amount", "Sale Date" };
        for (var i = 0; i < salesHeaders.Length; i++)
        {
            salesSheet.Cell(1, i + 1).Value = salesHeaders[i];
        }

        var salesRow = 2;
        foreach (var s in sales)
        {
            salesSheet.Cell(salesRow, 1).Value = s.Id;
            salesSheet.Cell(salesRow, 2).Value = s.MedicineName;
            salesSheet.Cell(salesRow, 3).Value = s.QuantitySold;
            salesSheet.Cell(salesRow, 4).Value = s.TotalAmount;
            salesSheet.Cell(salesRow, 5).Value = s.SaleDate.ToString("yyyy-MM-dd HH:mm");
            salesRow++;
        }

        StyleSheet(salesSheet, salesHeaders.Length, salesRow - 1);
        salesSheet.Column(4).Style.NumberFormat.Format = "#,##0.00";

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var fileName = $"JezMeds-Report-{DateTime.UtcNow:yyyyMMdd}.xlsx";
        return File(stream.ToArray(), XlsxContentType, fileName);
    }

    private static void StyleSheet(IXLWorksheet sheet, int columnCount, int lastRow)
    {
        var headerRow = sheet.Range(1, 1, 1, columnCount);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.FromHtml("#0D9488");
        headerRow.Style.Font.FontColor = XLColor.White;

        sheet.SheetView.FreezeRows(1);
        if (lastRow >= 1)
        {
            sheet.Range(1, 1, Math.Max(lastRow, 1), columnCount).SetAutoFilter();
        }

        sheet.Columns().AdjustToContents();
    }
}
