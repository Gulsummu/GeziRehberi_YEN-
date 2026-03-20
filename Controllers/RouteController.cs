using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GeziRehberi.Data;
using GeziRehberi.Models;

namespace GeziRehberi.Controllers;

[Authorize]
public class RouteController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public RouteController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost]
    public async Task<IActionResult> SaveRoute([FromBody] SaveRouteRequest request)
    {
        if (request == null || !request.CityIds.Any())
        {
            return BadRequest("Rota bilgisi eksik.");
        }

        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var routePlan = new RoutePlan
        {
            UserId = userId,
            RouteName = request.RouteName ?? "Yeni Rota",
            TripType = request.TripType ?? "Orta",
            TotalBudget = request.TotalBudget,
            StartDate = DateTime.Now,
            EndDate = DateTime.Now.AddDays(request.Days),
        };

        _context.RoutePlans.Add(routePlan);
        await _context.SaveChangesAsync(); // Get the inserted RoutePlan ID

        // Add cities in order
        for (int i = 0; i < request.CityIds.Count; i++)
        {
            var routeCity = new RouteCity
            {
                RoutePlanId = routePlan.Id,
                CityId = request.CityIds[i],
                Order = i + 1
            };
            _context.RouteCities.Add(routeCity);
        }

        await _context.SaveChangesAsync();

        return Json(new { success = true, routeId = routePlan.Id });
    }

    public async Task<IActionResult> MyRoutes()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var routes = await _context.RoutePlans
            .Include(rp => rp.RouteCities)
                .ThenInclude(rc => rc.City)
            .Where(rp => rp.UserId == userId)
            .OrderByDescending(rp => rp.Id)
            .ToListAsync();

        return View(routes);
    }
}

public class SaveRouteRequest
{
    public string RouteName { get; set; } = string.Empty;
    public decimal TotalBudget { get; set; }
    public int Days { get; set; }
    public string TripType { get; set; } = string.Empty;
    public List<int> CityIds { get; set; } = new List<int>();
}
