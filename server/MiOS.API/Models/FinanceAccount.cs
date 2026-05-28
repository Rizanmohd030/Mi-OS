namespace MiOS.API.Models;

public class FinanceAccount
{
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal StartingBalance { get; set; }

    public DateTime StartingBalanceMonth { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<FinanceTransaction> Transactions { get; set; } = new List<FinanceTransaction>();
}
