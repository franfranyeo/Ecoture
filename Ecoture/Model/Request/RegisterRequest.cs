﻿using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
    public class RegisterRequest
    {
        [Required, MinLength(2), MaxLength(100)]
        [RegularExpression(@"^[A-Za-z\s'\-.,]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string FirstName { get; set; } = string.Empty;

        [Required, MinLength(2), MaxLength(100)]
        [RegularExpression(@"^[A-Za-z\s'\-.,]+$", ErrorMessage = "Only allow letters, spaces, and characters: ' - , .")]
        public string LastName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(50)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$", ErrorMessage = "At least 1 digit, 1 uppercase letter, 1 lowercase letter, 1 special character, no spaces and between 8 to 15 characters")]
        public string Password { get; set; } = string.Empty;
        public string? ReferralCode { get; set; }  // Optional referral code
    }
}
