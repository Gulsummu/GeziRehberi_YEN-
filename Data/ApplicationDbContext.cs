using GeziRehberi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace GeziRehberi.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<Place> Places { get; set; } = null!;
    public DbSet<UserPreference> UserPreferences { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<RoutePlan> RoutePlans { get; set; } = null!;
    public DbSet<RouteCity> RouteCities { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Many-to-Many Relationships for Routing
        modelBuilder.Entity<RouteCity>()
            .HasOne(rc => rc.RoutePlan)
            .WithMany(rp => rp.RouteCities)
            .HasForeignKey(rc => rc.RoutePlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RouteCity>()
            .HasOne(rc => rc.City)
            .WithMany()
            .HasForeignKey(rc => rc.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed initial World Cities data
        modelBuilder.Entity<City>().HasData(
            new City
            {
                Id = 1,
                Name = "Istanbul",
                Country = "Turkey",
                ImageUrl = "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&q=80&w=2000",
                Description = "Kıtaların buluştuğu nokta, eşsiz camileri, sarayları ve boğazı ile tarihi ve modern dokuyu bir araya getiriyor.",
                HowToGetThere = "İstanbul Havalimanı (IST) veya Sabiha Gökçen (SAW) üzerinden ulaşabilirsiniz.",
                WhatToEat = "İskender Kebap, Simit, Boğaz kenarında Balık-Ekmek, Türk Kahvesi, Baklava.",
                WeatherSummary = "Yazlar sıcak ve nemli, kışlar ise soğuk, yağışlı ve bazen karlı geçer. Bahar ayları gezmek için en ideal zamandır.",
                Latitude = 41.0082,
                Longitude = 28.9784,
                BudgetRange = "Orta",
                Category = "Tarih, Kültür"
            },
            new City
            {
                Id = 2,
                Name = "Paris",
                Country = "France",
                ImageUrl = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2000",
                Description = "Aşıklar şehri, modanın, sanatın ve kültürün başkenti. Işıklar Şehri olarak da bilinir.",
                HowToGetThere = "Charles de Gaulle Havalimanı (CDG) veya Orly Havalimanı (ORY) kullanarak merkeze ulaşabilirsiniz.",
                WhatToEat = "Kruvasan, Makaron, Soğan Çorbası, Ratatouille, Salyangoz (Escargot).",
                WeatherSummary = "Ilıman bir okyanus iklimi görülür. Bahar ve yaz ayları turizm açısından en popüler ve keyifli zamanlarıdır.",
                Latitude = 48.8566,
                Longitude = 2.3522,
                BudgetRange = "Yüksek",
                Category = "Sanat, Romantizm"
            },
            new City
            {
                Id = 3,
                Name = "Tokyo",
                Country = "Japan",
                ImageUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=2000",
                Description = "Geleneksel tapınakların modern gökdelenlerle uyum içinde olduğu teknoloji ve kültür şehri.",
                HowToGetThere = "Narita Uluslararası Havalimanı veya Haneda Havalimanı (merkeze daha yakın) üzerinden ulaşabilirsiniz.",
                WhatToEat = "Sushi, Ramen, Tempura, Takoyaki, Matcha tatlıları.",
                WeatherSummary = "Temmuz ve Ağustos çok sıcak ve nemli olabilir. İlkbahar (Kiraz çiçekleri dönemi) ve Sonbahar en popüler ziyaret zamanlarıdır.",
                Latitude = 35.6762,
                Longitude = 139.6503,
                BudgetRange = "Yüksek",
                Category = "Teknoloji, Gelenek"
            }
        );

        // Seed Places
        modelBuilder.Entity<Place>().HasData(
            new Place
            {
                Id = 1, CityId = 1, Name = "Ayasofya",
                Description = "Dünya mimarlık tarihinin günümüze kadar ayakta kalmış en önemli anıtları arasında yer alan Ayasofya.",
                ImageUrl = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800",
                Type = "Tarihi", BudgetLevel = "Düşük"
            },
            new Place
            {
                Id = 2, CityId = 1, Name = "Kapalıçarşı",
                Description = "Dünyanın en eski ve en büyük kapalı çarşılarından biri.",
                ImageUrl = "https://images.unsplash.com/photo-1555541604-0618055eeefe?auto=format&fit=crop&q=80&w=800",
                Type = "Alışveriş", BudgetLevel = "Orta"
            },
            // Paris
            new Place
            {
                Id = 3, CityId = 2, Name = "Eyfel Kulesi",
                Description = "Paris'in sembolü ve en ikonik yapısı. Muhteşem bir manzara sunar.",
                ImageUrl = "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800",
                Type = "Anıt", BudgetLevel = "Orta"
            },
            new Place
            {
                Id = 4, CityId = 2, Name = "Louvre Müzesi",
                Description = "Mona Lisa başta olmak üzere binlerce tarihi esere ev sahipliği yapar.",
                ImageUrl = "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&q=80&w=800",
                Type = "Müze", BudgetLevel = "Orta"
            },
            // Tokyo
            new Place
            {
                Id = 5, CityId = 3, Name = "Senso-ji Tapınağı",
                Description = "Asakusa'da bulunan, Tokyo'nun en eski ve en ünlü Budist tapınağı.",
                ImageUrl = "https://images.unsplash.com/photo-1563261775-80252b444766?auto=format&fit=crop&q=80&w=800",
                Type = "Tapınak", BudgetLevel = "Düşük"
            }
        );

        // Seed Reviews
        modelBuilder.Entity<Review>().HasData(
            new Review { Id = 1, PlaceId = 1, UserName = "Ahmet Y.", Rating = 5, Comment = "Gerçekten büyüleyici bir atmosfer.", CreatedAt = new DateTime(2023, 5, 20) },
            new Review { Id = 2, PlaceId = 1, UserName = "Maria S.", Rating = 4, Comment = "Çok kalabalık ama kesinlikle görülmeli.", CreatedAt = new DateTime(2023, 6, 15) },
            new Review { Id = 3, PlaceId = 3, UserName = "Canan B.", Rating = 5, Comment = "Gece ışıklandırmasıyla harika görünüyor.", CreatedAt = new DateTime(2023, 8, 10) }
        );
    }
}
