namespace MiOS.API.Models;

public class Project
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "current";

    public bool Pinned { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}