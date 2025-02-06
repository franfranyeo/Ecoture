﻿using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Request
{
    public class AddAddressRequest
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }
    }
}
