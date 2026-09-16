namespace MedicineInventory.Api.Services;

public interface ITestService
{
    string GetMessage();
}

public class TestService : ITestService
{
    public string GetMessage()
    {
        return "Hello from MedicineInventory API!";
    }
}
