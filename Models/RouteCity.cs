namespace GeziRehberi.Models;

public class RouteCity
{
    public int Id { get; set; }
    
    // Foreign Keys
    public int RoutePlanId { get; set; }
    public RoutePlan? RoutePlan { get; set; }
    
    public int CityId { get; set; }
    public City? City { get; set; }
    
    // To preserve order of visitation
    public int Order { get; set; }
}
