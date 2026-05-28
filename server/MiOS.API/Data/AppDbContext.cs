using Microsoft.EntityFrameworkCore;
using MiOS.API.Models;

namespace MiOS.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    public DbSet<FinanceAccount> FinanceAccounts => Set<FinanceAccount>();
    public DbSet<FinanceTransaction> FinanceTransactions => Set<FinanceTransaction>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("projects");

            entity.Property(p => p.Id)
                .HasColumnName("id");

            entity.Property(p => p.Title)
                .HasColumnName("title");

            entity.Property(p => p.Description)
                .HasColumnName("description");

            entity.Property(p => p.Status)
                .HasColumnName("status");

            entity.Property(p => p.Pinned)
                .HasColumnName("pinned");

            entity.Property(p => p.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(p => p.Slug)
                .HasColumnName("slug");
        });
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("tasks");

            entity.Property(t => t.Id)
                .HasColumnName("id");

            entity.Property(t => t.Text)
                .HasColumnName("text");

            entity.Property(t => t.Completed)
                .HasColumnName("completed");

            entity.Property(t => t.CreatedAt)
                .HasColumnName("created_at");
        });
        modelBuilder.Entity<ProjectTask>(entity =>
        {
            entity.ToTable("project_tasks");

            entity.Property(t => t.Id)
                .HasColumnName("id");

            entity.Property(t => t.ProjectId)
                .HasColumnName("project_id");

            entity.Property(t => t.Text)
                .HasColumnName("text");

            entity.Property(t => t.Completed)
                .HasColumnName("completed");

            entity.Property(t => t.CreatedAt)
                .HasColumnName("created_at");

            entity.HasOne(t => t.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId);
        });
        modelBuilder.Entity<FinanceAccount>(entity =>
        {
            entity.ToTable("finance_accounts");

            entity.Property(a => a.Id)
                .HasColumnName("id");

            entity.Property(a => a.Name)
                .HasColumnName("name");

            entity.Property(a => a.StartingBalance)
                .HasColumnName("starting_balance")
                .HasColumnType("numeric(12,2)");

            entity.Property(a => a.StartingBalanceMonth)
                .HasColumnName("starting_balance_month");

            entity.Property(a => a.CreatedAt)
                .HasColumnName("created_at");
        });
        modelBuilder.Entity<FinanceTransaction>(entity =>
        {
            entity.ToTable("finance_transactions");

            entity.Property(t => t.Id)
                .HasColumnName("id");

            entity.Property(t => t.AccountId)
                .HasColumnName("account_id");

            entity.Property(t => t.Amount)
                .HasColumnName("amount")
                .HasColumnType("numeric(12,2)");

            entity.Property(t => t.Type)
                .HasColumnName("type");

            entity.Property(t => t.Reason)
                .HasColumnName("reason");

            entity.Property(t => t.Timestamp)
                .HasColumnName("timestamp");

            entity.HasOne(t => t.Account)
                .WithMany(a => a.Transactions)
                .HasForeignKey(t => t.AccountId);
        });

        base.OnModelCreating(modelBuilder);
    }

}
