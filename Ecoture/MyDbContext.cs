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
		}

	}
}
