using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RealEstate.Domain.Entities
{
    public class Photo
    {
        public int Id { get; set; }

        public int RealEstateId { get; set; }  

        public string ImageUrl { get; set; }

        public Estate Estate { get; set; }
    }
}
