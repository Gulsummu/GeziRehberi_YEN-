using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeziRehberi.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RoutePlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    RouteName = table.Column<string>(type: "TEXT", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TripType = table.Column<string>(type: "TEXT", nullable: false),
                    TotalBudget = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutePlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RouteCities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoutePlanId = table.Column<int>(type: "INTEGER", nullable: false),
                    CityId = table.Column<int>(type: "INTEGER", nullable: false),
                    Order = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RouteCities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RouteCities_Cities_CityId",
                        column: x => x.CityId,
                        principalTable: "Cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RouteCities_RoutePlans_RoutePlanId",
                        column: x => x.RoutePlanId,
                        principalTable: "RoutePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RouteCities_CityId",
                table: "RouteCities",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_RouteCities_RoutePlanId",
                table: "RouteCities",
                column: "RoutePlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RouteCities");

            migrationBuilder.DropTable(
                name: "RoutePlans");
        }
    }
}
