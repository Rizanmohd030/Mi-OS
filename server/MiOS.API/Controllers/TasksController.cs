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

    [HttpGet("{slug}")]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks(
        string slug
    )
    {
        var tasks = await _context.Tasks
            .Where(t => t.ProjectSlug == slug)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(
        TaskItem task
    )
    {
        task.CreatedAt = DateTime.UtcNow;

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        return Ok(task);
    }
}