﻿using Ecoture.Models.Enum;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace Models.Entity
{
    public class User
    {
        public int UserId { get; set; }

        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(255), JsonIgnore]
        public string Password { get; set; } = string.Empty;

        [MaxLength(20)]
        public string MobileNo { get; set; } = string.Empty;

        [Column(TypeName = "date")]
        public DateTime? DateofBirth { get; set; }

        public UserRole Role { get; set; } = UserRole.Customer; // default role is customer

        [MaxLength(255)]
        public string? PfpURL { get; set; } 

        [Column(TypeName = "datetime")]
        public DateTime LastLogin { get; set; }

        public bool Is2FAEnabled { get; set; } = false;

        public bool IsEmailVerified { get; set; } = false;

        [MaxLength(10)]
        public string? ReferralCode { get; set; }

        public bool DeleteRequested { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? DeleteRequestedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        public Membership? Membership { get; set; }

        //public ICollection<Referral> ReferralsSent { get; set; } = new List<Referral>(); // Referrals made by the user
        public ICollection<Referral> ReferralsReceived { get; set; } = new List<Referral>(); // Referrals received by the user

        //public ICollection<PointsTransaction> PointsTransactions { get; set; } = new List<PointsTransaction>(); // Points-related transactions

        //public ICollection<UserRedemptions> UserRedemptions { get; set; } = new List<UserRedemptions>(); // Redemption records

        public List<Referral>? ReferralsSent { get; set; }

        public List<PointsTransaction>? PointsTransactions { get; set; }

        public List<UserRedemptions>? UserRedemptions { get; set; }
    }
}
