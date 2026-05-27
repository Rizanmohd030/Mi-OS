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
    public DbSet<TaskItem> Tasks { get; set; }


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

    entity.Property(t => t.ProjectSlug)
        .HasColumnName("project_slug");

    entity.Property(t => t.Text)
        .HasColumnName("text");

    entity.Property(t => t.Completed)
        .HasColumnName("completed");

    entity.Property(t => t.CreatedAt)
        .HasColumnName("created_at");
});

    base.OnModelCreating(modelBuilder);
}

}