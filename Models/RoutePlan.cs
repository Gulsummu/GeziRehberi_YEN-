namespace GeziRehberi.Models;

public class RoutePlan
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty; // Bound to ApplicationUser natively
    public string RouteName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string TripType { get; set; } = "Ekonomik"; // Ekonomik, Lüks vb.
    public decimal TotalBudget { get; set; }
    
    // Navigation Property
    public ICollection<RouteCity> RouteCities { get; set; } = new List<RouteCity>();
}
