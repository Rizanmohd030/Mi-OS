using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiOS.API.Data;
using MiOS.API.Models;

namespace MiOS.API.Controllers;

[ApiController]
[Route("api/finance")]
public class FinanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public FinanceController(AppDbContext context)
    {
        _context = context;
    }

    private static DateTime EnsureUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }

    [HttpGet("accounts")]
    public async Task<ActionResult<IEnumerable<FinanceAccountSummary>>> GetAccounts()
    {
        var accounts = await _context.FinanceAccounts
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new FinanceAccountSummary
            {
                Id = a.Id,
                Name = a.Name,
                StartingBalance = a.StartingBalance,
                StartingBalanceMonth = a.StartingBalanceMonth,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(accounts);
    }

    [HttpPost("accounts")]
    public async Task<ActionResult<FinanceAccountSummary>> CreateAccount(
        FinanceAccountCreateRequest request
    )
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Account name is required.");
        }

        var startingMonth = request.StartingBalanceMonth
            ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var account = new FinanceAccount
        {
            Name = request.Name.Trim(),
            StartingBalance = request.StartingBalance,
            StartingBalanceMonth = EnsureUtc(startingMonth),
            CreatedAt = DateTime.UtcNow
        };

        _context.FinanceAccounts.Add(account);
        await _context.SaveChangesAsync();

        return Ok(new FinanceAccountSummary
        {
            Id = account.Id,
            Name = account.Name,
            StartingBalance = account.StartingBalance,
            StartingBalanceMonth = account.StartingBalanceMonth,
            CreatedAt = account.CreatedAt
        });
    }

    [HttpGet("accounts/{id:long}")]
    public async Task<ActionResult<FinanceAccountSummary>> GetAccount(long id)
    {
        var account = await _context.FinanceAccounts.FindAsync(id);

        if (account == null)
        {
            return NotFound();
        }

        return Ok(new FinanceAccountSummary
        {
            Id = account.Id,
            Name = account.Name,
            StartingBalance = account.StartingBalance,
            StartingBalanceMonth = account.StartingBalanceMonth,
            CreatedAt = account.CreatedAt
        });
    }

    [HttpDelete("accounts/{id:long}")]
    public async Task<IActionResult> DeleteAccount(long id)
    {
        var account = await _context.FinanceAccounts.FindAsync(id);

        if (account == null)
        {
            return NotFound();
        }

        var transactions = await _context.FinanceTransactions
            .Where(t => t.AccountId == id)
            .ToListAsync();

        _context.FinanceTransactions.RemoveRange(transactions);
        _context.FinanceAccounts.Remove(account);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("accounts/{id:long}/transactions")]
    public async Task<ActionResult<IEnumerable<FinanceTransactionDto>>> GetTransactions(
        long id,
        [FromQuery] int limit = 50
    )
    {
        var accountExists = await _context.FinanceAccounts.AnyAsync(a => a.Id == id);

        if (!accountExists)
        {
            return NotFound();
        }

        var cappedLimit = limit <= 0 ? 50 : Math.Min(limit, 200);

        var transactions = await _context.FinanceTransactions
            .Where(t => t.AccountId == id)
            .OrderByDescending(t => t.Timestamp)
            .Take(cappedLimit)
            .Select(t => new FinanceTransactionDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                Amount = t.Amount,
                Type = t.Type,
                Reason = t.Reason,
                Timestamp = t.Timestamp
            })
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpPost("accounts/{id:long}/transactions")]
    public async Task<ActionResult<FinanceTransactionDto>> CreateTransaction(
        long id,
        FinanceTransactionCreateRequest request
    )
    {
        var account = await _context.FinanceAccounts.FindAsync(id);

        if (account == null)
        {
            return NotFound();
        }

        var normalizedType = request.Type?.Trim().ToLowerInvariant();

        if (normalizedType is not ("income" or "expense"))
        {
            return BadRequest("Transaction type must be income or expense.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Transaction amount must be greater than zero.");
        }

        var transaction = new FinanceTransaction
        {
            AccountId = id,
            Amount = request.Amount,
            Type = normalizedType,
            Reason = request.Reason?.Trim() ?? string.Empty,
            Timestamp = EnsureUtc(request.Timestamp ?? DateTime.UtcNow)
        };

        _context.FinanceTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(new FinanceTransactionDto
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            Amount = transaction.Amount,
            Type = transaction.Type,
            Reason = transaction.Reason,
            Timestamp = transaction.Timestamp
        });
    }

    [HttpPut("accounts/{accountId:long}/transactions/{transactionId:long}")]
    public async Task<ActionResult<FinanceTransactionDto>> UpdateTransaction(
        long accountId,
        long transactionId,
        FinanceTransactionCreateRequest request
    )
    {
        var transaction = await _context.FinanceTransactions
            .FirstOrDefaultAsync(t => t.Id == transactionId && t.AccountId == accountId);

        if (transaction == null)
        {
            return NotFound();
        }

        var normalizedType = request.Type?.Trim().ToLowerInvariant();

        if (normalizedType is not ("income" or "expense"))
        {
            return BadRequest("Transaction type must be income or expense.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Transaction amount must be greater than zero.");
        }

        transaction.Amount = request.Amount;
        transaction.Type = normalizedType;
        transaction.Reason = request.Reason?.Trim() ?? string.Empty;
        transaction.Timestamp = EnsureUtc(request.Timestamp ?? transaction.Timestamp);

        await _context.SaveChangesAsync();

        return Ok(new FinanceTransactionDto
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            Amount = transaction.Amount,
            Type = transaction.Type,
            Reason = transaction.Reason,
            Timestamp = transaction.Timestamp
        });
    }

    [HttpDelete("accounts/{accountId:long}/transactions/{transactionId:long}")]
    public async Task<IActionResult> DeleteTransaction(long accountId, long transactionId)
    {
        var transaction = await _context.FinanceTransactions
            .FirstOrDefaultAsync(t => t.Id == transactionId && t.AccountId == accountId);

        if (transaction == null)
        {
            return NotFound();
        }

        _context.FinanceTransactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("accounts/{id:long}/ledger")]
    public async Task<ActionResult<FinanceLedgerResponse>> GetLedger(
        long id,
        [FromQuery] int limit = 5
    )
    {
        var account = await _context.FinanceAccounts.FindAsync(id);

        if (account == null)
        {
            return NotFound();
        }

        var cappedLimit = limit <= 0 ? 5 : Math.Min(limit, 50);

        var incomeTotal = await _context.FinanceTransactions
            .Where(t => t.AccountId == id && t.Type == "income")
            .SumAsync(t => (decimal?)t.Amount) ?? 0m;

        var expenseTotal = await _context.FinanceTransactions
            .Where(t => t.AccountId == id && t.Type == "expense")
            .SumAsync(t => (decimal?)t.Amount) ?? 0m;

        var ledgerTransactions = await _context.FinanceTransactions
            .Where(t => t.AccountId == id)
            .OrderByDescending(t => t.Timestamp)
            .Take(cappedLimit)
            .Select(t => new FinanceTransactionDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                Amount = t.Amount,
                Type = t.Type,
                Reason = t.Reason,
                Timestamp = t.Timestamp
            })
            .ToListAsync();

        return Ok(new FinanceLedgerResponse
        {
            Account = new FinanceAccountSummary
            {
                Id = account.Id,
                Name = account.Name,
                StartingBalance = account.StartingBalance,
                StartingBalanceMonth = account.StartingBalanceMonth,
                CreatedAt = account.CreatedAt
            },
            CurrentBalance = account.StartingBalance + incomeTotal - expenseTotal,
            Transactions = ledgerTransactions
        });
    }
}

public class FinanceAccountCreateRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal StartingBalance { get; set; }
    public DateTime? StartingBalanceMonth { get; set; }
}

public class FinanceTransactionCreateRequest
{
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTime? Timestamp { get; set; }
}

public class FinanceAccountSummary
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal StartingBalance { get; set; }
    public DateTime StartingBalanceMonth { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FinanceTransactionDto
{
    public long Id { get; set; }
    public long AccountId { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class FinanceLedgerResponse
{
    public FinanceAccountSummary Account { get; set; } = new();
    public decimal CurrentBalance { get; set; }
    public List<FinanceTransactionDto> Transactions { get; set; } = new();
}
