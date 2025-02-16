using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Ecoture.Migrations
{
    /// <inheritdoc />
    public partial class refund : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RefundRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    OrderItemId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "longtext", nullable: false),
                    Status = table.Column<string>(type: "longtext", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefundRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefundRequests_OrderItems_OrderItemId",
                        column: x => x.OrderItemId,
                        principalTable: "OrderItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 13, 44, 55, 172, DateTimeKind.Utc).AddTicks(9993), new DateTime(2025, 2, 15, 13, 44, 55, 172, DateTimeKind.Utc).AddTicks(9993) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 13, 44, 55, 172, DateTimeKind.Utc).AddTicks(9996), new DateTime(2025, 2, 15, 13, 44, 55, 172, DateTimeKind.Utc).AddTicks(9996) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 13, 44, 55, 172, DateTimeKind.Utc).AddTicks(9998), new DateTime(2025, 2, 15, 13, 44, 55, 172, DateTimeKind.Utc).AddTicks(9999) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "MembershipId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 2, 15, 13, 44, 55, 173, DateTimeKind.Utc), new DateTime(2025, 2, 15, 13, 44, 55, 173, DateTimeKind.Utc).AddTicks(1) });

            migrationBuilder.CreateIndex(
                name: "IX_RefundRequests_OrderItemId",
                table: "RefundRequests",
                column: "OrderItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefundRequests");

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
        }
    }
}
