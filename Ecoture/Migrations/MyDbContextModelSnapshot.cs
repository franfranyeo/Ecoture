﻿// <auto-generated />
using System;
using Ecoture;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Ecoture.Migrations
{
    [DbContext(typeof(MyDbContext))]
    partial class MyDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.12")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("ContentNewsletter", b =>
                {
                    b.Property<int>("ContentsContentId")
                        .HasColumnType("int");

                    b.Property<int>("NewsletterIssueId")
                        .HasColumnType("int");

                    b.HasKey("ContentsContentId", "NewsletterIssueId");

                    b.HasIndex("NewsletterIssueId");

                    b.ToTable("NewsletterContents", (string)null);
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Address", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<string>("ImageFile")
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Addresses");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Content", b =>
                {
                    b.Property<int>("ContentId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<bool>("Membership")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("PreferencesId")
                        .HasColumnType("int");

                    b.Property<string>("ProductIds")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("ContentId");

                    b.ToTable("Contents");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.CreditCard", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("CVV")
                        .IsRequired()
                        .HasMaxLength(3)
                        .HasColumnType("varchar(3)");

                    b.Property<string>("CardHolderName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("CardNumber")
                        .IsRequired()
                        .HasMaxLength(16)
                        .HasColumnType("varchar(16)");

                    b.Property<int>("ExpiryMonth")
                        .HasColumnType("int");

                    b.Property<int>("ExpiryYear")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("CreditCards");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Enquiry", b =>
                {
                    b.Property<int>("enquiryId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("createdAt")
                        .HasColumnType("datetime");

                    b.Property<string>("email")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("varchar(255)");

                    b.Property<string>("message")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("status")
                        .HasColumnType("int");

                    b.Property<string>("subject")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("varchar(255)");

                    b.Property<DateTime>("updatedAt")
                        .HasColumnType("datetime");

                    b.Property<int?>("userId")
                        .HasColumnType("int");

                    b.HasKey("enquiryId");

                    b.ToTable("Enquiries");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Membership", b =>
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

            modelBuilder.Entity("Ecoture.Model.Entity.Newsletter", b =>
                {
                    b.Property<int>("IssueId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ContentId")
                        .HasColumnType("int");

                    b.Property<DateTime>("DateSent")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("IssueTitle")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("NewsletterCategory")
                        .IsRequired()
                        .HasMaxLength(40)
                        .HasColumnType("varchar(40)");

                    b.HasKey("IssueId");

                    b.ToTable("Newsletters");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.PointsTransaction", b =>
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

            modelBuilder.Entity("Ecoture.Model.Entity.Referral", b =>
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

            modelBuilder.Entity("Ecoture.Model.Entity.Response", b =>
                {
                    b.Property<int>("responseId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("csoId")
                        .HasColumnType("int");

                    b.Property<int>("enquiryId")
                        .HasColumnType("int");

                    b.Property<string>("message")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime>("responseDate")
                        .HasColumnType("datetime");

                    b.HasKey("responseId");

                    b.HasIndex("enquiryId");

                    b.ToTable("Responses");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.User", b =>
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

            modelBuilder.Entity("Ecoture.Model.Entity.UserOtp", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Data")
                        .HasColumnType("longtext");

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

            modelBuilder.Entity("Ecoture.Model.Entity.UserRedemptions", b =>
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

            modelBuilder.Entity("Ecoture.Model.Entity.UserToken", b =>
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

            modelBuilder.Entity("Ecoture.Model.Entity.Voucher", b =>
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

            modelBuilder.Entity("Ecoture.Model.Response.MfaResponse", b =>
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

            modelBuilder.Entity("Ecoture.Models.Entity.Category", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Color", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.ToTable("Colors");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Fit", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.ToTable("Fits");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Product", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<string>("ImageFile")
                        .HasMaxLength(255)
                        .HasColumnType("varchar(255)");

                    b.Property<string>("LongDescription")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("varchar(1000)");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(10,2)");

                    b.Property<int>("PriceRange")
                        .HasColumnType("int");

                    b.Property<int>("StockQuantity")
                        .HasColumnType("int");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAddOrUpdate()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("Description")
                        .HasDatabaseName("IX_Product_Description");

                    b.HasIndex("Title")
                        .HasDatabaseName("IX_Product_Title");

                    b.HasIndex("UserId");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductCategory", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("CategoryId")
                        .HasColumnType("int");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("ProductId");

                    b.ToTable("ProductCategories");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductColor", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ColorId")
                        .HasColumnType("int");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ColorId");

                    b.HasIndex("ProductId");

                    b.ToTable("ProductColors");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductFit", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("FitId")
                        .HasColumnType("int");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("FitId");

                    b.HasIndex("ProductId");

                    b.ToTable("ProductFits");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductSize", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<int>("SizeId")
                        .HasColumnType("int");

                    b.Property<int>("StockQuantity")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ProductId");

                    b.HasIndex("SizeId");

                    b.ToTable("ProductSizes");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Review", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Comment")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<int>("Rating")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ProductId");

                    b.HasIndex("UserId");

                    b.ToTable("Reviews");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Size", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("Sizes");
                });

            modelBuilder.Entity("ContentNewsletter", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.Content", null)
                        .WithMany()
                        .HasForeignKey("ContentsContentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Ecoture.Model.Entity.Newsletter", null)
                        .WithMany()
                        .HasForeignKey("NewsletterIssueId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Address", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.CreditCard", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Membership", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithOne("Membership")
                        .HasForeignKey("Ecoture.Model.Entity.Membership", "userId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.PointsTransaction", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.Referral", "Referral")
                        .WithMany()
                        .HasForeignKey("referralId");

                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany("PointsTransactions")
                        .HasForeignKey("userId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Ecoture.Model.Entity.Voucher", "Voucher")
                        .WithMany("PointsTransactions")
                        .HasForeignKey("voucherId");

                    b.Navigation("Referral");

                    b.Navigation("User");

                    b.Navigation("Voucher");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Referral", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", null)
                        .WithMany("ReferralsReceived")
                        .HasForeignKey("UserId");

                    b.HasOne("Ecoture.Model.Entity.User", null)
                        .WithMany("ReferralsSent")
                        .HasForeignKey("UserId1");

                    b.HasOne("Ecoture.Model.Entity.User", "refereeUser")
                        .WithMany()
                        .HasForeignKey("refereeUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Ecoture.Model.Entity.User", "referrerUser")
                        .WithMany()
                        .HasForeignKey("referrerUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("refereeUser");

                    b.Navigation("referrerUser");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Response", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.Enquiry", "Enquiry")
                        .WithMany("Responses")
                        .HasForeignKey("enquiryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Enquiry");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.UserOtp", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.UserRedemptions", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany("UserRedemptions")
                        .HasForeignKey("userId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Ecoture.Model.Entity.Voucher", "Voucher")
                        .WithMany("UserRedemptions")
                        .HasForeignKey("voucherId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");

                    b.Navigation("Voucher");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.UserToken", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Product", b =>
                {
                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany("Products")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductCategory", b =>
                {
                    b.HasOne("Ecoture.Models.Entity.Category", "Category")
                        .WithMany("ProductCategories")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Ecoture.Models.Entity.Product", "Product")
                        .WithMany("ProductCategories")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductColor", b =>
                {
                    b.HasOne("Ecoture.Models.Entity.Color", "Color")
                        .WithMany("ProductColors")
                        .HasForeignKey("ColorId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Ecoture.Models.Entity.Product", "Product")
                        .WithMany("ProductColors")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Color");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductFit", b =>
                {
                    b.HasOne("Ecoture.Models.Entity.Fit", "Fit")
                        .WithMany("ProductFits")
                        .HasForeignKey("FitId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Ecoture.Models.Entity.Product", "Product")
                        .WithMany("ProductFits")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Fit");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.ProductSize", b =>
                {
                    b.HasOne("Ecoture.Models.Entity.Product", "Product")
                        .WithMany("ProductSizes")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Ecoture.Models.Entity.Size", "Size")
                        .WithMany("ProductSizes")
                        .HasForeignKey("SizeId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Product");

                    b.Navigation("Size");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Review", b =>
                {
                    b.HasOne("Ecoture.Models.Entity.Product", "Product")
                        .WithMany("Reviews")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Ecoture.Model.Entity.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Product");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Enquiry", b =>
                {
                    b.Navigation("Responses");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.User", b =>
                {
                    b.Navigation("Membership");

                    b.Navigation("PointsTransactions");

                    b.Navigation("Products");

                    b.Navigation("ReferralsReceived");

                    b.Navigation("ReferralsSent");

                    b.Navigation("UserRedemptions");
                });

            modelBuilder.Entity("Ecoture.Model.Entity.Voucher", b =>
                {
                    b.Navigation("PointsTransactions");

                    b.Navigation("UserRedemptions");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Category", b =>
                {
                    b.Navigation("ProductCategories");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Color", b =>
                {
                    b.Navigation("ProductColors");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Fit", b =>
                {
                    b.Navigation("ProductFits");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Product", b =>
                {
                    b.Navigation("ProductCategories");

                    b.Navigation("ProductColors");

                    b.Navigation("ProductFits");

                    b.Navigation("ProductSizes");

                    b.Navigation("Reviews");
                });

            modelBuilder.Entity("Ecoture.Models.Entity.Size", b =>
                {
                    b.Navigation("ProductSizes");
                });
#pragma warning restore 612, 618
        }
    }
}
