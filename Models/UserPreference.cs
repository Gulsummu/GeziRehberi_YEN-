namespace GeziRehberi.Models;

public class UserPreference
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string PreferredBudget { get; set; } = string.Empty;
    public string PreferredCategory { get; set; } = string.Empty;
}
