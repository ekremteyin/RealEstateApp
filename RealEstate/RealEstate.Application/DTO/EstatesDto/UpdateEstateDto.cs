using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RealEstate.Application.DTO.LocationsDto;

namespace RealEstate.Application.DTO.EstatesDto
{
    public class UpdateEstateDto
    {

        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }

        public EstateType Type { get; set; }
        public EstateStatus Status { get; set; }
        public Currency Currency { get; set; }

        public decimal Price { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public LocationDto Location { get; set; }
    }
}
