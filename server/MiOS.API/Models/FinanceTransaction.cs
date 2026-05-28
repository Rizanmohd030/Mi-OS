namespace MiOS.API.Models;

public class FinanceTransaction
{
    public long Id { get; set; }

    public long AccountId { get; set; }

    public decimal Amount { get; set; }

    public string Type { get; set; } = "expense";

    public string Reason { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; }

    public FinanceAccount? Account { get; set; }
}
