using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Interfaces.Repositories;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Repositories
{
    public class EstateRepository : IEstateRepository
    {
        private readonly RealEstateDbContext _context;

        public EstateRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<List<Estate>> GetAllAsync()
        {
            return await _context.Estates
                .Include(e => e.Photos) 
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Estate?> GetByIdAsync(int id)
        {
            return await _context.Estates
                .Include(e => e.Photos) 
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<int> AddAsync(Estate estate)
        {
            _context.Estates.Add(estate);
            await _context.SaveChangesAsync();
            return estate.Id;
        }

        public async Task UpdateAsync(Estate estate)
        {
            _context.Estates.Update(estate);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Estate estate)
        {
            _context.Estates.Remove(estate);
            await _context.SaveChangesAsync();
        }
    }
}
