using Ecoture.Models.Entity;

namespace Ecoture.Models.Entity
{
    public class ProductFit
    {
        public int Id { get; set; } // Primary Key

        public int ProductId { get; set; } // Foreign Key
        public Product Product { get; set; } = null!;

        public int FitId { get; set; } // Foreign Key
        public Fit Fit { get; set; } = null!;
    }
}
