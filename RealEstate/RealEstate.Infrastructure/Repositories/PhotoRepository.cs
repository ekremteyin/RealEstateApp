using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Interfaces.Repositories;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Repositories
{
    public class PhotoRepository : IPhotoRepository
    {
        private readonly RealEstateDbContext _context;

        public PhotoRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<List<Photo>> GetAllAsync()
        {
            return await _context.Photos.ToListAsync();
        }

        public async Task<Photo?> GetByIdAsync(int id)
        {
            return await _context.Photos.FindAsync(id);
        }

        public async Task<List<Photo>> GetByEstateIdAsync(int estateId)
        {
            return await _context.Photos
                .Where(p => p.RealEstateId == estateId)
                .ToListAsync();
        }

        public async Task<int> AddAsync(Photo photo)
        {
            _context.Photos.Add(photo);
            await _context.SaveChangesAsync();
            return photo.Id;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var photo = await _context.Photos.FindAsync(id);
            if (photo == null)
                return false;

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
