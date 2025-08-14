using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RealEstate.Application.DTO.PhotosDto
{
    public class ResultPhotoDto
    {
        public int Id { get; set; }
        public int RealEstateId { get; set; }
        public string ImageUrl { get; set; }
    }
}
