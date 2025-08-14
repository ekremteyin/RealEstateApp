using AutoMapper;
using RealEstate.Application.DTO.PhotosDto;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Mapping
{
    public class PhotoMappingProfile : Profile
    {
        public PhotoMappingProfile()
        {
            CreateMap<Photo, CreatePhotoDto>().ReverseMap();
            CreateMap<Photo, ResultPhotoDto>().ReverseMap();
        }
    }
}
