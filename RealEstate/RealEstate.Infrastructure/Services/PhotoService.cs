using AutoMapper;
using RealEstate.Application.DTO.PhotosDto;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Interfaces.Repositories;

namespace RealEstate.Infrastructure.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly IPhotoRepository _photoRepository;
        private readonly IEstateRepository _estateRepository; 
        private readonly IMapper _mapper;

        public PhotoService( IPhotoRepository photoRepository, IEstateRepository estateRepository,IMapper mapper)
        {
            _photoRepository = photoRepository;
            _estateRepository = estateRepository;
            _mapper = mapper;
        }

        public async Task<int> AddPhotoAsync(CreatePhotoDto createPhotoDto)
        {
            
            var estate = await _estateRepository.GetByIdAsync(createPhotoDto.RealEstateId);
            if (estate == null)
            {
                throw new KeyNotFoundException($"Estate {createPhotoDto.RealEstateId} bulunamadı.");
            }
            var photo = _mapper.Map<Photo>(createPhotoDto);
            return await _photoRepository.AddAsync(photo);
        }

        public async Task<List<ResultPhotoDto>> GetPhotosByEstateIdAsync(int estateId)
        {
            var photos = await _photoRepository.GetByEstateIdAsync(estateId);
            return _mapper.Map<List<ResultPhotoDto>>(photos);
        }

        public async Task<ResultPhotoDto?> GetPhotoByIdAsync(int id)
        {
            var photo = await _photoRepository.GetByIdAsync(id);
            if(photo == null)
                return null;
            return _mapper.Map<ResultPhotoDto>(photo);
        }

        public async Task<bool> DeletePhotoAsync(int id)
        {
           
            var photo = await _photoRepository.GetByIdAsync(id);
            if (photo is null) 
                return false;

            return await _photoRepository.DeleteAsync(id);
        }
    }
}
