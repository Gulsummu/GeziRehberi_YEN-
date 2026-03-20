using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GeziRehberi.Data;
using GeziRehberi.Models;

namespace GeziRehberi.Controllers;

public class CityController : Controller
{
    private readonly ApplicationDbContext _context;

    public CityController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Detail(int id)
    {
        var city = await _context.Cities
            .Include(c => c.Places)
            .ThenInclude(p => p.Reviews)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (city == null)
        {
            return NotFound();
        }

        return View(city);
    }

    [HttpPost]
    public async Task<IActionResult> AddReview(int placeId, int rating, string comment)
    {
        if (rating < 1 || rating > 5 || string.IsNullOrWhiteSpace(comment))
        {
            return BadRequest("Geçersiz puan veya yorum.");
        }

        var place = await _context.Places.FirstOrDefaultAsync(p => p.Id == placeId);
        if (place == null) return NotFound();

        var review = new Review
        {
            PlaceId = placeId,
            Rating = rating,
            Comment = comment,
            UserName = "Misafir Kullanıcı", // In a real app, from User.Identity
            CreatedAt = DateTime.Now
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Redirect back to the city detail page
        return RedirectToAction("Detail", new { id = place.CityId });
    }
}
