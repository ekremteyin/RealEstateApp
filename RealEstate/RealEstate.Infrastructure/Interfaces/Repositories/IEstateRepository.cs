using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Interfaces.Repositories
{
    public interface IEstateRepository
    {
        Task<List<Estate>> GetAllAsync();
        Task<Estate?> GetByIdAsync(int id);
        Task<int> AddAsync(Estate estate);
        Task UpdateAsync(Estate estate);
        Task DeleteAsync(Estate estate);
    }
}
