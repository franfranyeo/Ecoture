using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace EcotureAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MfaResponses",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Sms = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Email = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Authenticator = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MfaResponses", x => x.UserId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    FirstName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Password = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    MobileNo = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    DateofBirth = table.Column<DateTime>(type: "date", nullable: true),
                    Role = table.Column<int>(type: "int", nullable: false),
                    PfpURL = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    LastLogin = table.Column<DateTime>(type: "datetime", nullable: false),
                    Is2FAEnabled = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsPhoneVerified = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ReferralCode = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true),
                    DeleteRequested = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DeleteRequestedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Vouchers",
                columns: table => new
                {
                    voucherId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    voucherCode = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    voucherType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    voucherValue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    pointsRequired = table.Column<int>(type: "int", nullable: false),
                    startDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    endDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    isActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    isFirstTimeUseOnly = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    isOneTimeUseOnly = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    voucherLimit = table.Column<int>(type: "int", nullable: false),
                    voucherTitle = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    voucherDesc = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vouchers", x => x.voucherId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Memberships",
                columns: table => new
                {
                    membershipId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    tier = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    totalSpent = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    totalPoints = table.Column<int>(type: "int", nullable: false),
                    membershipStartDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    membershipEndDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    lastTierUpgradeDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    userId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Memberships", x => x.membershipId);
                    table.ForeignKey(
                        name: "FK_Memberships_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Referrals",
                columns: table => new
                {
                    referralId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    referrerUserId = table.Column<int>(type: "int", nullable: false),
                    refereeUserId = table.Column<int>(type: "int", nullable: false),
                    referralDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referrals", x => x.referralId);
                    table.ForeignKey(
                        name: "FK_Referrals_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Referrals_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Referrals_Users_refereeUserId",
                        column: x => x.refereeUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Referrals_Users_referrerUserId",
                        column: x => x.referrerUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserOTPs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Otp = table.Column<string>(type: "longtext", nullable: false),
                    OtpType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsVerified = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Data = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOTPs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserOTPs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "longtext", nullable: false),
                    TokenType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsUsed = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserRedemptions",
                columns: table => new
                {
                    redemptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    voucherId = table.Column<int>(type: "int", nullable: false),
                    pointsUsed = table.Column<int>(type: "int", nullable: false),
                    redemptionDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    status = table.Column<int>(type: "int", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRedemptions", x => x.redemptionId);
                    table.ForeignKey(
                        name: "FK_UserRedemptions_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRedemptions_Vouchers_voucherId",
                        column: x => x.voucherId,
                        principalTable: "Vouchers",
                        principalColumn: "voucherId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PointsTransactions",
                columns: table => new
                {
                    transactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    pointsEarned = table.Column<int>(type: "int", nullable: false),
                    pointsSpent = table.Column<int>(type: "int", nullable: false),
                    transactionType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    expiryDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    voucherId = table.Column<int>(type: "int", nullable: true),
                    orderId = table.Column<int>(type: "int", nullable: true),
                    referralId = table.Column<int>(type: "int", nullable: true),
                    reviewId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointsTransactions", x => x.transactionId);
                    table.ForeignKey(
                        name: "FK_PointsTransactions_Referrals_referralId",
                        column: x => x.referralId,
                        principalTable: "Referrals",
                        principalColumn: "referralId");
                    table.ForeignKey(
                        name: "FK_PointsTransactions_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PointsTransactions_Vouchers_voucherId",
                        column: x => x.voucherId,
                        principalTable: "Vouchers",
                        principalColumn: "voucherId");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Memberships_userId",
                table: "Memberships",
                column: "userId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PointsTransactions_referralId",
                table: "PointsTransactions",
                column: "referralId");

            migrationBuilder.CreateIndex(
                name: "IX_PointsTransactions_userId",
                table: "PointsTransactions",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_PointsTransactions_voucherId",
                table: "PointsTransactions",
                column: "voucherId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_refereeUserId",
                table: "Referrals",
                column: "refereeUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_referrerUserId",
                table: "Referrals",
                column: "referrerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_UserId",
                table: "Referrals",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_UserId1",
                table: "Referrals",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserOTPs_UserId",
                table: "UserOTPs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRedemptions_userId",
                table: "UserRedemptions",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRedemptions_voucherId",
                table: "UserRedemptions",
                column: "voucherId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTokens_UserId",
                table: "UserTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Memberships");

            migrationBuilder.DropTable(
                name: "MfaResponses");

            migrationBuilder.DropTable(
                name: "PointsTransactions");

            migrationBuilder.DropTable(
                name: "UserOTPs");

            migrationBuilder.DropTable(
                name: "UserRedemptions");

            migrationBuilder.DropTable(
                name: "UserTokens");

            migrationBuilder.DropTable(
                name: "Referrals");

            migrationBuilder.DropTable(
                name: "Vouchers");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
