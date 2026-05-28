using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiOS.API.Data;
using MiOS.API.Models;

namespace MiOS.API.Controllers;

[ApiController]
public class ProjectTasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectTasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("api/projects/{projectId:long}/tasks")]
    public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTasks(long projectId)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
        if (!projectExists)
        {
            return NotFound();
        }

        var tasks = await _context.ProjectTasks
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost("api/projects/{projectId:long}/tasks")]
    public async Task<ActionResult<ProjectTask>> CreateProjectTask(
        long projectId,
        ProjectTaskCreateRequest request
    )
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return BadRequest("Task text is required.");
        }

        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
        if (!projectExists)
        {
            return NotFound();
        }

        var task = new ProjectTask
        {
            ProjectId = projectId,
            Text = request.Text.Trim(),
            Completed = request.Completed,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProjectTasks.Add(task);
        await _context.SaveChangesAsync();

        return Ok(task);
    }

    [HttpPatch("api/project-tasks/{id:long}/toggle")]
    public async Task<ActionResult<ProjectTask>> ToggleProjectTask(long id)
    {
        var task = await _context.ProjectTasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        task.Completed = !task.Completed;
        await _context.SaveChangesAsync();

        return Ok(task);
    }

    [HttpDelete("api/project-tasks/{id:long}")]
    public async Task<ActionResult> DeleteProjectTask(long id)
    {
        var task = await _context.ProjectTasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        _context.ProjectTasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class ProjectTaskCreateRequest
{
    public string Text { get; set; } = string.Empty;
    public bool Completed { get; set; }
}
