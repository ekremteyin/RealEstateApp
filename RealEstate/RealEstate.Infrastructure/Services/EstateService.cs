using AutoMapper;
using RealEstate.Application.DTO.EstatesDto;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Interfaces.Repositories;

namespace RealEstate.Infrastructure.Services
{
    public class EstateService : IEstateService
    {
        private readonly IEstateRepository _estateRepository;
        private readonly IMapper _mapper;

        public EstateService(IEstateRepository estateRepository, IMapper mapper)
        {
            _estateRepository = estateRepository;
            _mapper = mapper;
        }

        public async Task<List<ResultEstateDto>> GetAllEstate()
        {
            var estates = await _estateRepository.GetAllAsync();
            return _mapper.Map<List<ResultEstateDto>>(estates);
        }

        public async Task<GetByEstateDto?> GetByIdEstate(int id)
        {
            var estate = await _estateRepository.GetByIdAsync(id);
            if (estate == null)
                return null;

            return _mapper.Map<GetByEstateDto>(estate);
        }


        public async Task<int> CreateEstate(CreateEstateDto createEstateDto)
        {
            var estate = _mapper.Map<Estate>(createEstateDto);
            await _estateRepository.AddAsync(estate);
            return estate.Id;
        }

        public async Task<bool> UpdateEstate(UpdateEstateDto updateEstateDto)
        {
            var estate = await _estateRepository.GetByIdAsync(updateEstateDto.Id);
            if (estate == null)
                return false;

            _mapper.Map(updateEstateDto, estate);
            await _estateRepository.UpdateAsync(estate);
            return true;
        }

        public async Task<bool> DeleteEstate(int id)
        {
            var estate = await _estateRepository.GetByIdAsync(id);
            if (estate == null)
                return false;

            await _estateRepository.DeleteAsync(estate);
            return true;
        }
    }
}
