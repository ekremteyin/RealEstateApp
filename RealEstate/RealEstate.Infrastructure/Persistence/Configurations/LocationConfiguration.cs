using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations
{
    public class LocationConfiguration : IEntityTypeConfiguration<Estate>
    {
        public void Configure(EntityTypeBuilder<Estate> builder)
        {
            builder.OwnsOne(e => e.Location, nav =>
            {
                nav.Property(l => l.Country).HasMaxLength(100);
                nav.Property(l => l.City).HasMaxLength(100);
                nav.Property(l => l.District).HasMaxLength(100);
                nav.Property(l => l.AddressDetail).HasMaxLength(200);
                nav.Property(l => l.Latitude).HasPrecision(9, 6);
                nav.Property(l => l.Longitude).HasPrecision(9, 6);
            });
        }
    }
}
