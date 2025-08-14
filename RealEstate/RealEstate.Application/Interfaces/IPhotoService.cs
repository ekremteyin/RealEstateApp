using RealEstate.Application.DTO.PhotosDto;

namespace RealEstate.Application.Interfaces
{
    public interface IPhotoService
    {
        Task<int> AddPhotoAsync(CreatePhotoDto dto);
        Task<List<ResultPhotoDto>> GetPhotosByEstateIdAsync(int estateId);
        Task<ResultPhotoDto?> GetPhotoByIdAsync(int id);
        Task<bool> DeletePhotoAsync(int id);
    }
}
