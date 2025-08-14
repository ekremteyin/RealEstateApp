using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using RealEstate.Infrastructure.Identity;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.API.Extensions
{
    public static class IdentityServiceExtensions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddIdentityCore<AppUser>(opt =>
            {
                
                opt.User.RequireUniqueEmail = false;

               
                opt.SignIn.RequireConfirmedAccount = false;

                
                opt.Password.RequiredLength = 6;
                opt.Password.RequireNonAlphanumeric = false;
                opt.Password.RequireUppercase = false;
                opt.Password.RequireDigit = false;
            })
            .AddRoles<IdentityRole<int>>()
            .AddEntityFrameworkStores<RealEstateDbContext>()
            .AddSignInManager<SignInManager<AppUser>>();

            // JWT
            var jwtKey = config["Jwt:Key"] ?? "8bQyZpK9w5r2X1nF0tM3cV7sY6uA4eH0JfL9pQ2sD8kR1mZ5cN7bT3gV6yW8qX2";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
     .AddJwtBearer(opt =>
     {
         opt.TokenValidationParameters = new TokenValidationParameters
         {
             ValidateIssuer = false,
             ValidateAudience = false,
             ValidateIssuerSigningKey = true,
             IssuerSigningKey = key,
             ValidateLifetime = true,
             ClockSkew = TimeSpan.FromMinutes(2) 
         };
         
         opt.Events = new JwtBearerEvents
         {
             OnAuthenticationFailed = ctx =>
             {
                 Console.WriteLine("JWT fail: " + ctx.Exception.Message);
                 return Task.CompletedTask;
             }
         };
     });

            services.AddAuthorization();
            return services;
        }
    }
}
