using Microsoft.EntityFrameworkCore;
using Ecoture.Model.Entity;
using Ecoture.Model.Enum;
using Ecoture.Model.Response;
using Ecoture.Models.Entity;


namespace Ecoture
{
    public class MyDbContext : DbContext
	{
		private readonly IConfiguration _configuration;

		public MyDbContext(IConfiguration configuration)
		{
			_configuration = configuration;
		}

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
		{
			string? connectionString = _configuration.GetConnectionString("MyConnection");
			if (connectionString != null)
			{
				optionsBuilder.UseMySQL(connectionString);
			}
		}


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

        // AHMED DB CONTEXT 
        public required DbSet<Address> Addresses { get; set; } // Addresses table
		public required DbSet<CreditCard> CreditCards { get; set; } // New CreditCards table

        // FRAN DB CONTEXT
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
            // ✅ Configure many-to-many relationships
            ConfigureProductSizeRelationship(modelBuilder);
            ConfigureProductColorRelationship(modelBuilder);
            ConfigureProductFitRelationship(modelBuilder);
            ConfigureProductCategoryRelationship(modelBuilder);

            // ✅ Configure one-to-many relationships
            ConfigureReviewRelationship(modelBuilder);
            ConfigureResponseRelationship(modelBuilder);

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

            modelBuilder.Entity<Referral>()
                .HasOne(r => r.referrerUser)  // Navigation property
                .WithMany() // If User has a collection: .WithMany(u => u.ReferralsMade)
                .HasForeignKey(r => r.referrerUserId)  // Foreign Key
                .OnDelete(DeleteBehavior.Restrict); // Prevents cascade delete

            modelBuilder.Entity<Referral>()
                .HasOne(r => r.refereeUser)  // Navigation property
                .WithMany() // If User has a collection: .WithMany(u => u.ReferralsReceived)
                .HasForeignKey(r => r.refereeUserId)  // Foreign Key
                .OnDelete(DeleteBehavior.Restrict); // Prevents cascade delete

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
