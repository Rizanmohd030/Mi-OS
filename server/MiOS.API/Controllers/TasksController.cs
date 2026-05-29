using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using MiOS.API.Data;
using MiOS.API.Models;

namespace MiOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        var tasks = await _context.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItemCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return BadRequest("Task text is required.");
        }

        var task = new TaskItem
        {
            Text = request.Text.Trim(),
            Completed = request.Completed
        };
        task.CreatedAt = DateTime.UtcNow;

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        return Ok(task);
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<TaskItem>> ToggleTask(
        long id
    )
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        task.Completed = !task.Completed;

        await _context.SaveChangesAsync();

        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(
        long id
    )
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<TaskItem>> UpdateTask(long id, TaskItemUpdateRequest request)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Text))
        {
            task.Text = request.Text.Trim();
        }

        if (request.Completed.HasValue)
        {
            task.Completed = request.Completed.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(task);
    }
}

public class TaskItemCreateRequest
{
    public string Text { get; set; } = string.Empty;
    public bool Completed { get; set; }
}

public class TaskItemUpdateRequest
{
    public string? Text { get; set; }
    public bool? Completed { get; set; }
}
