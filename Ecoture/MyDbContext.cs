using Microsoft.EntityFrameworkCore;
using Ecoture.Model.Entity;
using Ecoture.Model.Enum;
using Ecoture.Model.Response;

namespace Ecoture
{
    public class MyDbContext : DbContext
	{
		private readonly IConfiguration _configuration;

        public MyDbContext(DbContextOptions<MyDbContext> options, IConfiguration configuration)
            : base(options)
        {
            _configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                string? connectionString = _configuration.GetConnectionString("MyConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new Exception("Database connection string is missing in appsettings.json.");
                }
                optionsBuilder.UseMySQL(connectionString);
            }
        }

        // ✅ Define DbSets for Entities
        public DbSet<Enquiry> Enquiries { get; set; }
        public DbSet<Response> Responses { get; set; }
        public DbSet<Content> Contents { get; set; }
        public DbSet<Newsletter> Newsletters { get; set; }
        public required DbSet<Product> Products { get; set; }
        public required DbSet<Size> Sizes { get; set; }
        public required DbSet<ProductSize> ProductSizes { get; set; }
        public required DbSet<Review> Reviews { get; set; }
        public required DbSet<Color> Colors { get; set; }
        public required DbSet<ProductColor> ProductColors { get; set; }
        public required DbSet<ProductFit> ProductFits { get; set; }
        public required DbSet<Fit> Fits { get; set; }
        public required DbSet<ProductCategory> ProductCategories { get; set; }
        public required DbSet<Category> Categories { get; set; }

         // Ahmed Additional DbSets (if needed)
        public required DbSet<Address> Addresses { get; set; }
        public required DbSet<CreditCard> CreditCards { get; set; }

        public required DbSet<Cart> Carts { get; set; } // New Cart Table
        public required DbSet<Order> Orders { get; set; } // Orders Table

        // Order Items Table
        public required DbSet<OrderItem> OrderItems { get; set; }
        public required DbSet<RefundRequest> RefundRequests { get; set; }


        // FRAN DB CONTEXT
        public required DbSet<User> Users { get; set; }
        public required DbSet<UserToken> UserTokens { get; set; }
        public required DbSet<UserOtp> UserOTPs { get; set; }
        public required DbSet<MfaResponse> MfaResponses { get; set; }
        public required DbSet<Membership> Memberships { get; set; }
        public required DbSet<PointsTransaction> PointsTransactions { get; set; }
        public required DbSet<UserRedemptions> UserRedemptions { get; set; }
        public required DbSet<Referral> Referrals { get; set; }
        public required DbSet<Reward> Rewards { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
            modelBuilder.Entity<Membership>().HasData(
                new Membership
                {
                    MembershipId = 1,
                    Tier = MembershipTiers.Bronze,
                    SpendingRequired = 0.00m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Membership
                {
                    MembershipId = 2,
                    Tier = MembershipTiers.Silver,
                    SpendingRequired = 2000.00m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Membership
                {
                    MembershipId = 3,
                    Tier = MembershipTiers.Gold,
                    SpendingRequired = 4000.00m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Membership
                {
                    MembershipId = 4,
                    Tier = MembershipTiers.None,
                    SpendingRequired = 0.00m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );

            modelBuilder.Entity<User>()
                .HasOne(u => u.Membership) 
                .WithMany()
                .HasForeignKey(u => u.MembershipId) 
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
                .HasKey(pt => pt.TransactionId);

            modelBuilder.Entity<PointsTransaction>()
                .HasOne(pt => pt.User)
                .WithMany(u => u.PointsTransactions)
                .HasForeignKey(pt => pt.UserId);

            modelBuilder.Entity<PointsTransaction>()
                .HasOne(pt => pt.Reward)
                .WithMany(pt => pt.PointsTransactions)
                .HasForeignKey(pt => pt.RewardId);

            modelBuilder.Entity<PointsTransaction>()
                .HasOne(pt => pt.Referral)
                .WithMany()
                .HasForeignKey(pt => pt.ReferralId);

            // UserRedemption relationships
            modelBuilder.Entity<UserRedemptions>()
                .HasKey(pt => pt.redemptionId);

            modelBuilder.Entity<UserRedemptions>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRedemptions)
                .HasForeignKey(ur => ur.userId);

            modelBuilder.Entity<UserRedemptions>()
                .HasOne(ur => ur.Reward)
                .WithMany(v => v.UserRedemptions)
                .HasForeignKey(ur => ur.voucherId);

            modelBuilder.Entity<Response>()
				.HasOne(r => r.Enquiry)
				.WithMany(e => e.Responses)
				.HasForeignKey(r => r.enquiryId)
				.OnDelete(DeleteBehavior.Cascade);


			//  Configure many-to-many relationship: Products ↔ Sizes
			modelBuilder.Entity<Cart>()
                .HasOne(c => c.Product)
                .WithMany()
                .HasForeignKey(c => c.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            // ✅ Configure many-to-many relationships
            ConfigureProductSizeRelationship(modelBuilder);
            ConfigureProductColorRelationship(modelBuilder);
            ConfigureProductFitRelationship(modelBuilder);
            ConfigureProductCategoryRelationship(modelBuilder);

            // ✅ Configure one-to-many relationships
            ConfigureReviewRelationship(modelBuilder);
            ConfigureResponseRelationship(modelBuilder);

            // modelBuilder.Entity<Newsletter>()
            //     .HasMany(n => n.Contents)
            //     .WithMany()
            //     .UsingEntity(j => j.ToTable("NewsletterContents"));

            // ✅ Configure decimal precision for Product Price
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(10,2)");

            // ✅ Configure timestamps with default values
            modelBuilder.Entity<Product>()
                .Property(p => p.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Product>()
                .Property(p => p.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate();

            // ✅ Configure indexes for performance optimization
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Title)
                .HasDatabaseName("IX_Product_Title");

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Description)
                .HasDatabaseName("IX_Product_Description");

			base.OnModelCreating(modelBuilder);
		}

        // ✅ Many-to-Many: Products ↔ Sizes
        private void ConfigureProductSizeRelationship(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProductSize>()
                .HasKey(ps => ps.Id);

            modelBuilder.Entity<ProductSize>()
                .HasOne(ps => ps.Product)
                .WithMany(p => p.ProductSizes)
                .HasForeignKey(ps => ps.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductSize>()
                .HasOne(ps => ps.Size)
                .WithMany(s => s.ProductSizes)
                .HasForeignKey(ps => ps.SizeId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        // ✅ Many-to-Many: Products ↔ Colors
        private void ConfigureProductColorRelationship(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProductColor>()
                .HasKey(pc => pc.Id);

            modelBuilder.Entity<ProductColor>()
                .HasOne(pc => pc.Product)
                .WithMany(p => p.ProductColors)
                .HasForeignKey(pc => pc.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductColor>()
                .HasOne(pc => pc.Color)
                .WithMany(c => c.ProductColors)
                .HasForeignKey(pc => pc.ColorId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        // ✅ Many-to-Many: Products ↔ Fits
        private void ConfigureProductFitRelationship(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProductFit>()
                .HasKey(pf => pf.Id);

            modelBuilder.Entity<ProductFit>()
                .HasOne(pf => pf.Product)
                .WithMany(p => p.ProductFits)
                .HasForeignKey(pf => pf.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductFit>()
                .HasOne(pf => pf.Fit)
                .WithMany(f => f.ProductFits)
                .HasForeignKey(pf => pf.FitId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        // ✅ Many-to-Many: Products ↔ Categories
        private void ConfigureProductCategoryRelationship(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProductCategory>()
                .HasKey(pc => pc.Id);

            modelBuilder.Entity<ProductCategory>()
                .HasOne(pc => pc.Product)
                .WithMany(p => p.ProductCategories)
                .HasForeignKey(pc => pc.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.ProductCategories)
                .HasForeignKey(pc => pc.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        // ✅ One-to-Many: Products ↔ Reviews
        private void ConfigureReviewRelationship(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        // ✅ One-to-Many: Enquiries ↔ Responses
        private void ConfigureResponseRelationship(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Response>()
                .HasOne(r => r.Enquiry)
                .WithMany(e => e.Responses)
                .HasForeignKey(r => r.enquiryId)
                .OnDelete(DeleteBehavior.Cascade);
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
                    context.MfaResponses.Add(new MfaResponse { UserId = 1 });
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
