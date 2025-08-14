using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations
{
    public class PhotoConfiguration : IEntityTypeConfiguration<Photo>
    {
        public void Configure(EntityTypeBuilder<Photo> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.ImageUrl)
                   .IsRequired()
                   .HasMaxLength(500);

            
            builder.HasOne(p => p.Estate)
                   .WithMany(e => e.Photos)
                   .HasForeignKey(p => p.RealEstateId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.ToTable("Photos");
        }
    }
}
