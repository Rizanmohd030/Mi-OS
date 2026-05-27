namespace MiOS.API.Models;

public class TaskItem
{
    public long Id { get; set; }

    public string ProjectSlug { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;

    public bool Completed { get; set; }

    public DateTime CreatedAt { get; set; }
}