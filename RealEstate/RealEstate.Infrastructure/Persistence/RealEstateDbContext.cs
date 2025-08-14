using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Identity; // AppUser burada

namespace RealEstate.Infrastructure.Persistence
{
    public class RealEstateDbContext : IdentityDbContext<AppUser, IdentityRole<int>, int>
    {
        public RealEstateDbContext(DbContextOptions<RealEstateDbContext> options) : base(options)
        {
        }

        public DbSet<Estate> Estates { get; set; }
        public DbSet<Photo> Photos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); 

            
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(RealEstateDbContext).Assembly);
        }
    }
}
