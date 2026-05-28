namespace MiOS.API.Models;

public class ProjectTask
{
    public long Id { get; set; }

    public long ProjectId { get; set; }

    public string Text { get; set; } = string.Empty;

    public bool Completed { get; set; }

    public DateTime CreatedAt { get; set; }

    public Project? Project { get; set; }
}
