using Ecoture;
using EcotureAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Configuration;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddDbContext<MyDbContext>();

// Add CORS Policy
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Authentication 
var secret = builder.Configuration.GetValue<string>("Authentication:Secret");
if (string.IsNullOrEmpty(secret))
{
    throw new Exception("Secret is required for JWT authentication.");
}
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secret)
            ),
        };
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddTransient<IUserManager, UserManager>();
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddSingleton<ISmsService, SmsService>();


var app = builder.Build();


// Seed database with admin user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        // Get DbContext and Configuration
        var context = services.GetRequiredService<MyDbContext>();
        var configuration = services.GetRequiredService<IConfiguration>();

        // Apply migrations
        await context.Database.MigrateAsync();

        // Seed admin user
        await SeedData.InitializeAsync(context, configuration);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during database seeding: {ex.Message}");
    }
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
