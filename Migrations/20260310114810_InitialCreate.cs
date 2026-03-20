using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GeziRehberi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Country = table.Column<string>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    WhatToEat = table.Column<string>(type: "TEXT", nullable: false),
                    HowToGetThere = table.Column<string>(type: "TEXT", nullable: false),
                    WeatherSummary = table.Column<string>(type: "TEXT", nullable: false),
                    Latitude = table.Column<double>(type: "REAL", nullable: false),
                    Longitude = table.Column<double>(type: "REAL", nullable: false),
                    BudgetRange = table.Column<string>(type: "TEXT", nullable: false),
                    Category = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    PreferredBudget = table.Column<string>(type: "TEXT", nullable: false),
                    PreferredCategory = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Places",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    BudgetLevel = table.Column<string>(type: "TEXT", nullable: false),
                    CityId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Places", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Places_Cities_CityId",
                        column: x => x.CityId,
                        principalTable: "Cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserName = table.Column<string>(type: "TEXT", nullable: false),
                    Comment = table.Column<string>(type: "TEXT", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PlaceId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Places_PlaceId",
                        column: x => x.PlaceId,
                        principalTable: "Places",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "Id", "BudgetRange", "Category", "Country", "Description", "HowToGetThere", "ImageUrl", "Latitude", "Longitude", "Name", "WeatherSummary", "WhatToEat" },
                values: new object[,]
                {
                    { 1, "Orta", "Tarih, Kültür", "Turkey", "Kıtaların buluştuğu nokta, eşsiz camileri, sarayları ve boğazı ile tarihi ve modern dokuyu bir araya getiriyor.", "İstanbul Havalimanı (IST) veya Sabiha Gökçen (SAW) üzerinden ulaşabilirsiniz.", "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&q=80&w=2000", 41.008200000000002, 28.978400000000001, "Istanbul", "Yazlar sıcak ve nemli, kışlar ise soğuk, yağışlı ve bazen karlı geçer. Bahar ayları gezmek için en ideal zamandır.", "İskender Kebap, Simit, Boğaz kenarında Balık-Ekmek, Türk Kahvesi, Baklava." },
                    { 2, "Yüksek", "Sanat, Romantizm", "France", "Aşıklar şehri, modanın, sanatın ve kültürün başkenti. Işıklar Şehri olarak da bilinir.", "Charles de Gaulle Havalimanı (CDG) veya Orly Havalimanı (ORY) kullanarak merkeze ulaşabilirsiniz.", "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2000", 48.8566, 2.3521999999999998, "Paris", "Ilıman bir okyanus iklimi görülür. Bahar ve yaz ayları turizm açısından en popüler ve keyifli zamanlarıdır.", "Kruvasan, Makaron, Soğan Çorbası, Ratatouille, Salyangoz (Escargot)." },
                    { 3, "Yüksek", "Teknoloji, Gelenek", "Japan", "Geleneksel tapınakların modern gökdelenlerle uyum içinde olduğu teknoloji ve kültür şehri.", "Narita Uluslararası Havalimanı veya Haneda Havalimanı (merkeze daha yakın) üzerinden ulaşabilirsiniz.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=2000", 35.676200000000001, 139.65029999999999, "Tokyo", "Temmuz ve Ağustos çok sıcak ve nemli olabilir. İlkbahar (Kiraz çiçekleri dönemi) ve Sonbahar en popüler ziyaret zamanlarıdır.", "Sushi, Ramen, Tempura, Takoyaki, Matcha tatlıları." }
                });

            migrationBuilder.InsertData(
                table: "Places",
                columns: new[] { "Id", "BudgetLevel", "CityId", "Description", "ImageUrl", "Name", "Type" },
                values: new object[,]
                {
                    { 1, "Düşük", 1, "Dünya mimarlık tarihinin günümüze kadar ayakta kalmış en önemli anıtları arasında yer alan Ayasofya.", "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800", "Ayasofya", "Tarihi" },
                    { 2, "Orta", 1, "Dünyanın en eski ve en büyük kapalı çarşılarından biri.", "https://images.unsplash.com/photo-1555541604-0618055eeefe?auto=format&fit=crop&q=80&w=800", "Kapalıçarşı", "Alışveriş" },
                    { 3, "Orta", 2, "Paris'in sembolü ve en ikonik yapısı. Muhteşem bir manzara sunar.", "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800", "Eyfel Kulesi", "Anıt" },
                    { 4, "Orta", 2, "Mona Lisa başta olmak üzere binlerce tarihi esere ev sahipliği yapar.", "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&q=80&w=800", "Louvre Müzesi", "Müze" },
                    { 5, "Düşük", 3, "Asakusa'da bulunan, Tokyo'nun en eski ve en ünlü Budist tapınağı.", "https://images.unsplash.com/photo-1563261775-80252b444766?auto=format&fit=crop&q=80&w=800", "Senso-ji Tapınağı", "Tapınak" }
                });

            migrationBuilder.InsertData(
                table: "Reviews",
                columns: new[] { "Id", "Comment", "CreatedAt", "PlaceId", "Rating", "UserName" },
                values: new object[,]
                {
                    { 1, "Gerçekten büyüleyici bir atmosfer.", new DateTime(2026, 3, 10, 14, 48, 9, 768, DateTimeKind.Local).AddTicks(19), 1, 5, "Ahmet Y." },
                    { 2, "Çok kalabalık ama kesinlikle görülmeli.", new DateTime(2026, 3, 8, 14, 48, 9, 768, DateTimeKind.Local).AddTicks(251), 1, 4, "Maria S." },
                    { 3, "Gece ışıklandırmasıyla harika görünüyor.", new DateTime(2026, 3, 10, 14, 48, 9, 768, DateTimeKind.Local).AddTicks(313), 3, 5, "Canan B." }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Places_CityId",
                table: "Places",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_PlaceId",
                table: "Reviews",
                column: "PlaceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "UserPreferences");

            migrationBuilder.DropTable(
                name: "Places");

            migrationBuilder.DropTable(
                name: "Cities");
        }
    }
}
