using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Ecoture.Migrations
{
    /// <inheritdoc />
    public partial class ProductSizeColorQTYMapped : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Referrals_Users_UserId",
                table: "Referrals");

            migrationBuilder.DropForeignKey(
                name: "FK_Referrals_Users_UserId1",
                table: "Referrals");

            migrationBuilder.DropTable(
                name: "ProductColors");

            migrationBuilder.DropTable(
                name: "ProductSizes");

            migrationBuilder.DropIndex(
                name: "IX_Referrals_UserId",
                table: "Referrals");

            migrationBuilder.DropIndex(
                name: "IX_Referrals_UserId1",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Referrals");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Sizes",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext");

            migrationBuilder.CreateTable(
                name: "ProductSizeColors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ColorId = table.Column<int>(type: "int", nullable: false),
                    SizeId = table.Column<int>(type: "int", nullable: false),
                    StockQuantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductSizeColors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductSizeColors_Colors_ColorId",
                        column: x => x.ColorId,
                        principalTable: "Colors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductSizeColors_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductSizeColors_Sizes_SizeId",
                        column: x => x.SizeId,
                        principalTable: "Sizes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9788), new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9788) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9791), new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9791) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9793), new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9793) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9795), new DateTime(2025, 2, 15, 16, 41, 1, 619, DateTimeKind.Utc).AddTicks(9795) });

            migrationBuilder.CreateIndex(
                name: "IX_ProductSizeColors_ColorId",
                table: "ProductSizeColors",
                column: "ColorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSizeColors_ProductId",
                table: "ProductSizeColors",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSizeColors_SizeId",
                table: "ProductSizeColors",
                column: "SizeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductSizeColors");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Sizes",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Referrals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "Referrals",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductColors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ColorId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductColors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductColors_Colors_ColorId",
                        column: x => x.ColorId,
                        principalTable: "Colors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductColors_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ProductSizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    SizeId = table.Column<int>(type: "int", nullable: false),
                    StockQuantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductSizes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductSizes_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductSizes_Sizes_SizeId",
                        column: x => x.SizeId,
                        principalTable: "Sizes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9640), new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9641) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9644), new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9645) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9646), new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9647) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9649), new DateTime(2025, 2, 11, 3, 3, 14, 182, DateTimeKind.Utc).AddTicks(9649) });

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_UserId",
                table: "Referrals",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_UserId1",
                table: "Referrals",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProductColors_ColorId",
                table: "ProductColors",
                column: "ColorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductColors_ProductId",
                table: "ProductColors",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSizes_ProductId",
                table: "ProductSizes",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSizes_SizeId",
                table: "ProductSizes",
                column: "SizeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Referrals_Users_UserId",
                table: "Referrals",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Referrals_Users_UserId1",
                table: "Referrals",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "UserId");
        }
    }
}
