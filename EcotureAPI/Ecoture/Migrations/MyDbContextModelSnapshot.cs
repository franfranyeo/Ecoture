﻿// <auto-generated />
using System;
using Ecoture;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace EcotureAPI.Migrations
{
    [DbContext(typeof(MyDbContext))]
    partial class MyDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("EcotureAPI.Models.DataTransferObjects.MfaResponse", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<bool>("Authenticator")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("Email")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("Sms")
                        .HasColumnType("tinyint(1)");

                    b.HasKey("UserId");

                    b.ToTable("MfaResponses");
                });

            modelBuilder.Entity("EcotureAPI.Models.Entity.UserOtp", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("ExpirationDate")
                        .HasColumnType("datetime(6)");

                    b.Property<bool>("IsVerified")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Otp")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("OtpType")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("UserOTPs");
                });

            modelBuilder.Entity("EcotureAPI.Models.Entity.UserToken", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("ExpirationDate")
                        .HasColumnType("datetime(6)");

                    b.Property<bool>("IsUsed")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Token")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("TokenType")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("UserTokens");
                });

            modelBuilder.Entity("Models.Entity.Membership", b =>
                {
                    b.Property<int>("membershipId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("createdAt")
                        .HasColumnType("datetime");

                    b.Property<DateTime>("lastTierUpgradeDate")
                        .HasColumnType("datetime");

                    b.Property<DateTime>("membershipEndDate")
                        .HasColumnType("datetime");

                    b.Property<DateTime>("membershipStartDate")
                        .HasColumnType("datetime");

                    b.Property<string>("tier")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<int>("totalPoints")
                        .HasColumnType("int");

                    b.Property<decimal>("totalSpent")
                        .HasColumnType("decimal(10,2)");

                    b.Property<DateTime>("updatedAt")
                        .HasColumnType("datetime");

                    b.Property<int>("userId")
                        .HasColumnType("int");

                    b.HasKey("membershipId");

                    b.HasIndex("userId")
                        .IsUnique();

                    b.ToTable("Memberships");
                });

            modelBuilder.Entity("Models.Entity.PointsTransaction", b =>
                {
                    b.Property<int>("transactionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("createdAt")
                        .HasColumnType("datetime");

                    b.Property<DateTime>("expiryDate")
                        .HasColumnType("datetime");

                    b.Property<int?>("orderId")
                        .HasColumnType("int");

                    b.Property<int>("pointsEarned")
                        .HasColumnType("int");

                    b.Property<int>("pointsSpent")
                        .HasColumnType("int");

                    b.Property<int?>("referralId")
                        .HasColumnType("int");

                    b.Property<int?>("reviewId")
                        .HasColumnType("int");

                    b.Property<string>("transactionType")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<int>("userId")
                        .HasColumnType("int");

                    b.Property<int?>("voucherId")
                        .HasColumnType("int");

                    b.HasKey("transactionId");

                    b.HasIndex("referralId");

                    b.HasIndex("userId");

                    b.HasIndex("voucherId");

                    b.ToTable("PointsTransactions");
                });

            modelBuilder.Entity("Models.Entity.Referral", b =>
                {
                    b.Property<int>("referralId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int?>("UserId")
                        .HasColumnType("int");

                    b.Property<int?>("UserId1")
                        .HasColumnType("int");

                    b.Property<int>("refereeUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("referralDate")
                        .HasColumnType("datetime");

                    b.Property<int>("referrerUserId")
                        .HasColumnType("int");

                    b.HasKey("referralId");

                    b.HasIndex("UserId");

                    b.HasIndex("UserId1");

                    b.HasIndex("refereeUserId");

                    b.HasIndex("referrerUserId");

                    b.ToTable("Referrals");
                });

            modelBuilder.Entity("Models.Entity.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime");

                    b.Property<DateTime?>("DateofBirth")
                        .HasColumnType("date");

                    b.Property<bool>("DeleteRequested")
                        .HasColumnType("tinyint(1)");

                    b.Property<DateTime?>("DeleteRequestedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("varchar(255)");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<bool>("Is2FAEnabled")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsEmailVerified")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsPhoneVerified")
                        .HasColumnType("tinyint(1)");

                    b.Property<DateTime>("LastLogin")
                        .HasColumnType("datetime");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("MobileNo")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("varchar(255)");

                    b.Property<string>("PfpURL")
                        .HasMaxLength(255)
                        .HasColumnType("varchar(255)");

                    b.Property<string>("ReferralCode")
                        .HasMaxLength(10)
                        .HasColumnType("varchar(10)");

                    b.Property<int>("Role")
                        .HasColumnType("int");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime");

                    b.HasKey("UserId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Models.Entity.UserRedemptions", b =>
                {
                    b.Property<int>("redemptionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("pointsUsed")
                        .HasColumnType("int");

                    b.Property<DateTime>("redemptionDate")
                        .HasColumnType("datetime");

                    b.Property<int>("status")
                        .HasMaxLength(50)
                        .HasColumnType("int");

                    b.Property<int>("userId")
                        .HasColumnType("int");

                    b.Property<int>("voucherId")
                        .HasColumnType("int");

                    b.HasKey("redemptionId");

                    b.HasIndex("userId");

                    b.HasIndex("voucherId");

                    b.ToTable("UserRedemptions");
                });

            modelBuilder.Entity("Models.Entity.Voucher", b =>
                {
                    b.Property<int>("voucherId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("endDate")
                        .HasColumnType("datetime");

                    b.Property<bool>("isActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("isFirstTimeUseOnly")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("isOneTimeUseOnly")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("pointsRequired")
                        .HasColumnType("int");

                    b.Property<DateTime>("startDate")
                        .HasColumnType("datetime");

                    b.Property<string>("voucherCode")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("varchar(10)");

                    b.Property<string>("voucherDesc")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<int>("voucherLimit")
                        .HasColumnType("int");

                    b.Property<string>("voucherTitle")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<string>("voucherType")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<decimal>("voucherValue")
                        .HasColumnType("decimal(10,2)");

                    b.HasKey("voucherId");

                    b.ToTable("Vouchers");
                });

            modelBuilder.Entity("EcotureAPI.Models.Entity.UserOtp", b =>
                {
                    b.HasOne("Models.Entity.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("EcotureAPI.Models.Entity.UserToken", b =>
                {
                    b.HasOne("Models.Entity.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Models.Entity.Membership", b =>
                {
                    b.HasOne("Models.Entity.User", "User")
                        .WithOne("Membership")
                        .HasForeignKey("Models.Entity.Membership", "userId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Models.Entity.PointsTransaction", b =>
                {
                    b.HasOne("Models.Entity.Referral", "Referral")
                        .WithMany()
                        .HasForeignKey("referralId");

                    b.HasOne("Models.Entity.User", "User")
                        .WithMany("PointsTransactions")
                        .HasForeignKey("userId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.Entity.Voucher", "Voucher")
                        .WithMany("PointsTransactions")
                        .HasForeignKey("voucherId");

                    b.Navigation("Referral");

                    b.Navigation("User");

                    b.Navigation("Voucher");
                });

            modelBuilder.Entity("Models.Entity.Referral", b =>
                {
                    b.HasOne("Models.Entity.User", null)
                        .WithMany("ReferralsReceived")
                        .HasForeignKey("UserId");

                    b.HasOne("Models.Entity.User", null)
                        .WithMany("ReferralsSent")
                        .HasForeignKey("UserId1");

                    b.HasOne("Models.Entity.User", "refereeUser")
                        .WithMany()
                        .HasForeignKey("refereeUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.Entity.User", "referrerUser")
                        .WithMany()
                        .HasForeignKey("referrerUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("refereeUser");

                    b.Navigation("referrerUser");
                });

            modelBuilder.Entity("Models.Entity.UserRedemptions", b =>
                {
                    b.HasOne("Models.Entity.User", "User")
                        .WithMany("UserRedemptions")
                        .HasForeignKey("userId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.Entity.Voucher", "Voucher")
                        .WithMany("UserRedemptions")
                        .HasForeignKey("voucherId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");

                    b.Navigation("Voucher");
                });

            modelBuilder.Entity("Models.Entity.User", b =>
                {
                    b.Navigation("Membership");

                    b.Navigation("PointsTransactions");

                    b.Navigation("ReferralsReceived");

                    b.Navigation("ReferralsSent");

                    b.Navigation("UserRedemptions");
                });

            modelBuilder.Entity("Models.Entity.Voucher", b =>
                {
                    b.Navigation("PointsTransactions");

                    b.Navigation("UserRedemptions");
                });
#pragma warning restore 612, 618
        }
    }
}
