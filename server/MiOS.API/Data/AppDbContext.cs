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
    });

    base.OnModelCreating(modelBuilder);
}
}