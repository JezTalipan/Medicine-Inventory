using MedicineInventory.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedicineInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly ITestService _testService;

    public TestController(ITestService testService)
    {
        _testService = testService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var message = _testService.GetMessage();

        return Ok(new
        {
            success = true,
            message = message
        });
    }
}