﻿using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Entity
{
    public class Fit
    {
        public int Id { get; set; } // Primary Key

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        // Navigation property for many-to-many relationship with products
        public List<ProductFit> ProductFits { get; set; } = new();
    }
}
