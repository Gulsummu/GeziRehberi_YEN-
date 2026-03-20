namespace GeziRehberi.Models;

public class Review
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty; // Mock user for now
    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; } // 1 to 5
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public int PlaceId { get; set; }
    public Place? Place { get; set; }
}
