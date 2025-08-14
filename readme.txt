Nuget Paketleri
[RealEstate.API]
- Microsoft.AspNetCore.Authentication.JwtBearer
- Swashbuckle.AspNetCore
- AutoMapper.Extensions.Microsoft.DependencyInjection

[RealEstate.Infrastructure]
- Microsoft.EntityFrameworkCore
- Microsoft.EntityFrameworkCore.Design
- Microsoft.EntityFrameworkCore.SqlServer          
- Microsoft.AspNetCore.Identity.EntityFrameworkCore



Genel Mimari

Backend: ASP.NET Core Web API + Entity Framework Core + ASP.NET Identity (JWT ile)
DB: EF Core (SQL Server )
Auth: JWT Bearer, roller (Admin, User)
Frontend: React + Vite + Axios + React Router
Geocode: MapTiler (primary) + OSM (fallback)
