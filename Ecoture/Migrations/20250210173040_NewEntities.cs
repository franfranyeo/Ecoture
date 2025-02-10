using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Ecoture.Migrations
{
    /// <inheritdoc />
    public partial class NewEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contents",
                columns: table => new
                {
                    ContentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    PreferencesId = table.Column<int>(type: "int", nullable: false),
                    Membership = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ProductIds = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contents", x => x.ContentId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Newsletters",
                columns: table => new
                {
                    IssueId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    IssueTitle = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    ContentId = table.Column<int>(type: "int", nullable: false),
                    DateSent = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    NewsletterCategory = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Newsletters", x => x.IssueId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NewsletterContents",
                columns: table => new
                {
                    ContentsContentId = table.Column<int>(type: "int", nullable: false),
                    NewsletterIssueId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsletterContents", x => new { x.ContentsContentId, x.NewsletterIssueId });
                    table.ForeignKey(
                        name: "FK_NewsletterContents_Contents_ContentsContentId",
                        column: x => x.ContentsContentId,
                        principalTable: "Contents",
                        principalColumn: "ContentId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NewsletterContents_Newsletters_NewsletterIssueId",
                        column: x => x.NewsletterIssueId,
                        principalTable: "Newsletters",
                        principalColumn: "IssueId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_NewsletterContents_NewsletterIssueId",
                table: "NewsletterContents",
                column: "NewsletterIssueId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NewsletterContents");

            migrationBuilder.DropTable(
                name: "Contents");

            migrationBuilder.DropTable(
                name: "Newsletters");
        }
    }
}
