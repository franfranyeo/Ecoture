using Microsoft.EntityFrameworkCore;
using Ecoture.Models.Entity;
using Ecoture.Models;

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
        public required DbSet<Product> Products { get; set; }
        public required DbSet<User> Users { get; set; }
        public required DbSet<Size> Sizes { get; set; }
        public required DbSet<ProductSize> ProductSizes { get; set; }
        public required DbSet<Review> Reviews { get; set; }
        public required DbSet<Color> Colors { get; set; }
        public required DbSet<ProductColor> ProductColors { get; set; }
        public required DbSet<ProductFit> ProductFits { get; set; }
        public required DbSet<Fit> Fits { get; set; }
        public required DbSet<ProductCategory> ProductCategories { get; set; }
        public required DbSet<Category> Categories { get; set; }

        // ✅ Additional DbSets (if needed)
        public required DbSet<Address> Addresses { get; set; }
        public required DbSet<CreditCard> CreditCards { get; set; }

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
}
