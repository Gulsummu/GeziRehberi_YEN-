namespace GeziRehberi.Models;

public class Place
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public string ImageUrl { get; set; } = string.Empty; // Place specific image
    public string Type { get; set; } = string.Empty; // e.g., Historical, Museum
    public string BudgetLevel { get; set; } = string.Empty; // Low, Medium, High
    
    public int CityId { get; set; }
    public City? City { get; set; }

    // Navigation property
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
