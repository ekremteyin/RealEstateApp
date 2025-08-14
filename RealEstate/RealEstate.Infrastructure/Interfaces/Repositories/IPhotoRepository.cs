using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RealEstate.Infrastructure.Interfaces.Repositories
{
    public interface IPhotoRepository
    {
        Task<List<Photo>> GetAllAsync();
        Task<Photo?> GetByIdAsync(int id);
        Task<List<Photo>> GetByEstateIdAsync(int estateId);
        Task<int> AddAsync(Photo photo);
        Task<bool> DeleteAsync(int id);
    }
}
