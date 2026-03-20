namespace GeziRehberi.Models;

public class City
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty; // Hero Image for the city
    
    // Tab details
    public string Description { get; set; } = string.Empty; // Gezilecek Yerler summary
    public string WhatToEat { get; set; } = string.Empty; // Ne Yenir tab
    public string HowToGetThere { get; set; } = string.Empty; // Nasıl Gidilir tab
    public string WeatherSummary { get; set; } = string.Empty; // Hava Durumu tab

    // Map Coordinates
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string BudgetRange { get; set; } = string.Empty; // e.g., Low, Medium, High
    public string Category { get; set; } = string.Empty; // e.g., Historical, Nature, Sea

    // Navigation property
    public ICollection<Place> Places { get; set; } = new List<Place>();
}
