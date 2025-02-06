using Microsoft.EntityFrameworkCore;
using Ecoture.Models.Entity;
using Ecoture.Models;


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
		public required DbSet<User> Users { get; set; }
		public required DbSet<Size> Sizes { get; set; } // DbSet for Sizes
		public required DbSet<ProductSize> ProductSizes { get; set; } // DbSet for ProductSizes
		public required DbSet<Review> Reviews { get; set; } // DbSet for Reviews
		public required DbSet<Color> Colors { get; set; } // DbSet for Colors
		public required DbSet<ProductColor> ProductColors { get; set; } // DbSet for ProductColors

		// AHMED DB CONTEXT 
		public required DbSet<Address> Addresses { get; set; } // Addresses table
		public required DbSet<CreditCard> CreditCards { get; set; } // New CreditCards table

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{

			modelBuilder.Entity<Response>()
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

			base.OnModelCreating(modelBuilder);
		}

	}
}
