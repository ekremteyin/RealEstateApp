using AutoMapper;
using RealEstate.Application.DTO.EstatesDto;
using RealEstate.Application.DTO.LocationsDto;
using RealEstate.Application.DTO.PhotosDto;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Mapping
{
    public class EstateMappingProfile : Profile
    {
        public EstateMappingProfile()
        {
            CreateMap<Estate, ResultEstateDto>().ReverseMap();
            CreateMap<Estate, GetByEstateDto>().ReverseMap();
            CreateMap<Estate, CreateEstateDto>().ReverseMap();
            CreateMap<Estate, UpdateEstateDto>().ReverseMap();

            CreateMap<Location, LocationDto>().ReverseMap();
            
            

        }
    }
}
