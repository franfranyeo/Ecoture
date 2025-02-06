using EcotureAPI.Models.Enum;
using EcotureAPI.Models.Entity;
using EcotureAPI.Models.Response;
using Microsoft.EntityFrameworkCore;
using Twilio.Http;

namespace EcotureAPI
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
                .HasKey(pt => pt.RedemptionId);

            modelBuilder.Entity<UserRedemptions>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRedemptions)
                .HasForeignKey(ur => ur.UserId);

            modelBuilder.Entity<UserRedemptions>()
                .HasOne(ur => ur.Voucher)
                .WithMany(v => v.UserRedemptions)
                .HasForeignKey(ur => ur.VoucherId);

            modelBuilder.Entity<EcotureAPI.Models.Entity.Response>()
                .HasOne(r => r.Enquiry)
                .WithMany(e => e.Responses)
                .HasForeignKey(r => r.enquiryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Newsletter>()
                .HasMany(n => n.Contents)
                .WithMany()
                .UsingEntity(j => j.ToTable("NewsletterContents"));


            //  Configure many-to-many relationship: Products ↔ Sizes
            modelBuilder.Entity<ProductSize>()
                .HasKey(ps => ps.Id); // Define primary key

            modelBuilder.Entity<ProductSize>()
                .HasOne(ps => ps.Product)
                .WithMany(p => p.ProductSizes)
                .HasForeignKey(ps => ps.ProductId)
                .OnDelete(DeleteBehavior.Cascade) //  Delete sizes when product is deleted
                .IsRequired();

            modelBuilder.Entity<ProductSize>()
                .HasOne(ps => ps.Size)
                .WithMany(s => s.ProductSizes)
                .HasForeignKey(ps => ps.SizeId)
                .OnDelete(DeleteBehavior.Restrict) //  Prevent deleting sizes if linked to a product
                .IsRequired();

            //  Configure many-to-many relationship: Products ↔ Colors
            modelBuilder.Entity<ProductColor>()
                .HasKey(pc => pc.Id); // Define primary key

            modelBuilder.Entity<ProductColor>()
                .HasOne(pc => pc.Product)
                .WithMany(p => p.ProductColors)
                .HasForeignKey(pc => pc.ProductId)
                .OnDelete(DeleteBehavior.Cascade) //  Delete colors when product is deleted
                .IsRequired();

            modelBuilder.Entity<ProductColor>()
                .HasOne(pc => pc.Color)
                .WithMany(c => c.ProductColors)
                .HasForeignKey(pc => pc.ColorId)
                .OnDelete(DeleteBehavior.Restrict) //  Prevent deleting colors if linked to a product
                .IsRequired();

            //  Configure one-to-many relationship: Products ↔ Reviews
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade) //  Delete reviews when product is deleted
                .IsRequired();

            //  Configure one-to-many relationship: Users ↔ Reviews
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict) //  Prevent deleting users if they have reviews
                .IsRequired();

            //  Configure decimal precision for Product Price
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(10,2)");

            //  Configure timestamps with default values
            modelBuilder.Entity<Product>()
                .Property(p => p.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Product>()
                .Property(p => p.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate(); //  Ensure `UpdatedAt` updates when modified

            //  Configure indexes for performance optimization
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Title)
                .HasDatabaseName("IX_Product_Title");

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Description)
                .HasDatabaseName("IX_Product_Description");
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
