using Ecoture.Models.Enum;
using EcotureAPI.Models.DataTransferObjects;
using EcotureAPI.Models.Entity;
using Microsoft.EntityFrameworkCore;
using Models.Entity;

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

        public required DbSet<UserToken> UserTokens { get; set; }
        public required DbSet<UserOtp> UserOTPs { get; set; }
        public required DbSet<MfaResponse> MfaResponses { get; set; }
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

            modelBuilder.Entity<MfaResponse>().HasKey(m => m.UserId);

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
                .HasKey(pt => pt.transactionId);

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
                .HasKey(pt => pt.redemptionId);

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

                // Get admin credentials from configuration
                string adminEmail = configuration["AdminSettings:AdminEmail"];
                string adminPassword = configuration["AdminSettings:AdminPassword"];

                if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
                {
                    throw new InvalidOperationException("Admin email or password is not configured.");
                }

                // Check if any users exist in the database
                if (!await context.Users.AnyAsync())
                {
                    // Database is empty, we can safely create admin with ID 1
                    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(adminPassword);

                    var adminUser = new User
                    {
                        UserId = 1,
                        FirstName = "Admin",
                        LastName = "User",
                        Email = adminEmail,
                        Password = hashedPassword,
                        Role = UserRole.Admin,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    context.Users.Add(adminUser);
                    await context.SaveChangesAsync();

                    Console.WriteLine("Admin user successfully created with ID 1.");
                }
                else
                {
                    // Check if admin exists
                    var adminExists = await context.Users.AnyAsync(u => u.Email == adminEmail);
                    if (!adminExists)
                    {
                        // Create admin user with next available ID
                        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(adminPassword);

                        var adminUser = new User
                        {
                            FirstName = "Admin",
                            LastName = "User",
                            Email = adminEmail,
                            Password = hashedPassword,
                            Role = UserRole.Admin,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        context.Users.Add(adminUser);
                        await context.SaveChangesAsync();

                        Console.WriteLine($"Admin user successfully created with next available ID.");
                    }
                    else
                    {
                        Console.WriteLine("Admin user already exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding admin user: {ex.Message}");
                throw; // Rethrow to ensure the application startup fails if seeding fails
            }
        }
    }

}
