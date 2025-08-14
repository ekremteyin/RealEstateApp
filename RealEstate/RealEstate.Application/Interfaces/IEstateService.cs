using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RealEstate.Application.DTO.EstatesDto;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Interfaces
{
    public interface IEstateService
    {
        Task<List<ResultEstateDto>> GetAllEstate();
        Task<GetByEstateDto?> GetByIdEstate(int id);
        Task<int> CreateEstate(CreateEstateDto createEstateDto);
        Task<bool> UpdateEstate(UpdateEstateDto updateEstateDto);
        Task<bool> DeleteEstate(int id);
    }

}
