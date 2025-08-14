using RealEstate.Application.DTO.LocationsDto;
using RealEstate.Application.DTO.PhotosDto;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTO.EstatesDto
{
    public class GetByEstateDto
    {
        public int Id { get; set; }
        public string Title { get; set; }

        
        public EstateType Type { get; set; }
        public EstateStatus Status { get; set; }
        public Currency Currency { get; set; }

        public decimal Price { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string? Description { get; set; }

       
        public LocationDto Location { get; set; }
        public List<ResultPhotoDto> Photos { get; set; } = new();
    }
}
