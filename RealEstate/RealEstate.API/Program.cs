using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;

using RealEstate.API.Extensions;                 
using RealEstate.Application.Interfaces;
using RealEstate.Application.Mapping;
using RealEstate.Infrastructure.Identity;
using RealEstate.Infrastructure.Interfaces.Repositories;
using RealEstate.Infrastructure.Persistence;
using RealEstate.Infrastructure.Repositories;
using RealEstate.Infrastructure.Services;
using RealEstate.API.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<RealEstateDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Uygulama servisleri
builder.Services.AddScoped<IEstateService, EstateService>();
builder.Services.AddScoped<IEstateRepository, EstateRepository>();
builder.Services.AddScoped<IPhotoRepository, PhotoRepository>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddAutoMapper(typeof(EstateMappingProfile));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITokenService, TokenService>();

//  JWT (extension)
builder.Services.AddIdentityServices(builder.Configuration);


builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RealEstate API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",        
        BearerFormat = "JWT",
        Description = "Access token'ý girin."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Client", p =>
        p.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
         .AllowAnyHeader()
         .AllowAnyMethod());
});

var app = builder.Build();
var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(Path.Combine(webRoot, "uploads"));


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("Client");
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

await app.SeedIdentityAsync();
app.MapControllers();
app.Run();
