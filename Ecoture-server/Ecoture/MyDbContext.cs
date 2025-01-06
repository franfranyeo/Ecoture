using Ecoture.Models;
using Ecoture.Models.Enum;
using Microsoft.EntityFrameworkCore;

namespace Ecoture
{
    public class MyDbContext(IConfiguration configuration) : DbContext
    {
        private readonly IConfiguration _configuration = configuration;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            string? connectionString = _configuration.GetConnectionString("MyConnection");
            if (connectionString != null)
            {
                optionsBuilder.UseMySQL(connectionString);
            }
        }

        public required DbSet<User> Users { get; set; }

        public required DbSet<Membership> Memberships { get; set; }

        public required DbSet<PointsTransaction> PointsTransactions { get; set; }

        public required DbSet<UserRedemptions> UserRedemptions { get; set; }

        public required DbSet<Referral> Referrals { get; set; }

        public required DbSet<Voucher> Vouchers { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Membership)
                .WithOne(m => m.User)
                .HasForeignKey<Membership>(m => m.userId)
                .OnDelete(DeleteBehavior.Cascade);

            // Referral relationships
            modelBuilder.Entity<Referral>()
                .HasOne(r => r.referrerUser)
                .WithMany()
                .HasForeignKey(r => r.referrerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Referral>()
                .HasOne(r => r.refereeUser)
                .WithMany()
                .HasForeignKey(r => r.refereeUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // PointsTransaction relationships
            modelBuilder.Entity<PointsTransaction>()
                .HasOne(pt => pt.User)
                .WithMany(u => u.PointsTransactions)
                .HasForeignKey(pt => pt.userId);

            modelBuilder.Entity<PointsTransaction>()
                .HasOne(pt => pt.Voucher)
                .WithMany(v => v.PointsTransactions)
                .HasForeignKey(pt => pt.voucherId);

            modelBuilder.Entity<PointsTransaction>()
                .HasOne(pt => pt.Referral)
                .WithMany()
                .HasForeignKey(pt => pt.referralId);

            // UserRedemption relationships
            modelBuilder.Entity<UserRedemptions>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRedemptions)
                .HasForeignKey(ur => ur.userId);

            modelBuilder.Entity<UserRedemptions>()
                .HasOne(ur => ur.Voucher)
                .WithMany(v => v.UserRedemptions)
                .HasForeignKey(ur => ur.voucherId);
        }
    }

    public static class SeedData
    {
        public static async Task InitializeAsync(MyDbContext context, IConfiguration configuration)
        {
            try
            {
                // Ensure the database is created and migrations are applied
                await context.Database.MigrateAsync();

                // Check if admin user exists
                string adminEmail = configuration["AdminSettings:AdminEmail"];
                string adminPassword = configuration["AdminSettings:AdminPassword"];

                if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
                {
                    Console.WriteLine("Admin email or password is not configured.");
                    return;
                }

                var adminUser = await context.Users.FirstOrDefaultAsync(u => u.email == adminEmail);
                if (adminUser != null)
                {
                    Console.WriteLine("Admin user already exists.");
                    return;
                }

                // Hash the password
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(adminPassword);

                // Temporarily disable auto-increment
                await context.Database.ExecuteSqlRawAsync("SET @OLD_AUTO_INCREMENT = (SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users');");
                await context.Database.ExecuteSqlRawAsync("SET FOREIGN_KEY_CHECKS = 0;");
                await context.Database.ExecuteSqlRawAsync("ALTER TABLE Users AUTO_INCREMENT = 1;");

                // Create Admin User
                context.Users.Add(new User
                {
                    userId = 1,
                    firstName = "Admin",
                    lastName = "User",
                    email = adminEmail,
                    password = hashedPassword,
                    role = UserRole.Admin,
                    createdAt = DateTime.UtcNow,
                    updatedAt = DateTime.UtcNow
                });

                await context.SaveChangesAsync();

                // Reset auto-increment to continue from the next available ID
                await context.Database.ExecuteSqlRawAsync("SET @NEW_AUTO_INCREMENT = (SELECT MAX(userId) + 1 FROM Users);");
                await context.Database.ExecuteSqlRawAsync("ALTER TABLE Users AUTO_INCREMENT = @NEW_AUTO_INCREMENT;");
                await context.Database.ExecuteSqlRawAsync("SET FOREIGN_KEY_CHECKS = 1;");

                Console.WriteLine("Admin user is successfully created.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding admin user: {ex.Message}");
            }
        }
    }

}
