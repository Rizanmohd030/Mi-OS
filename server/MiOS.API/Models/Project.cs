namespace MiOS.API.Models;

public class Project
{
    public long Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "current";

    public bool Pinned { get; set; }

    public DateTime CreatedAt { get; set; }
    public string Slug { get; set; } = string.Empty;

    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}