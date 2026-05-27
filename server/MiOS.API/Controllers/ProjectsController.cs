using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiOS.API.Data;
using MiOS.API.Models;

namespace MiOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        var projects = await _context.Projects
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects);
    }

    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject(Project project)
    {
        project.CreatedAt = DateTime.UtcNow;

        _context.Projects.Add(project);

        await _context.SaveChangesAsync();

        return Ok(project);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<Project>> GetProjectBySlug(string slug)
    {
        var project = await _context.Projects
       .FirstOrDefaultAsync(p => p.Slug == slug);

        if (project == null)
        {
            return NotFound();
        }

        return Ok(project);
    }

    [HttpPatch("{id}/pin")]
    public async Task<ActionResult> TogglePin(long id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        project.Pinned = !project.Pinned;

        await _context.SaveChangesAsync();

        return Ok(project);
    }
}