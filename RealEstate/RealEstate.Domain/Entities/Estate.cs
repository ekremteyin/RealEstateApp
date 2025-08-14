using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RealEstate.Domain.Enums;



namespace RealEstate.Domain.Entities

{
    public class Estate
    {
        public int Id { get; set; }               
        public string Title { get; set; }          
        public string? Description { get; set; }  
      
        public decimal Price { get; set; }
        public DateTime StartDate { get; set; }    
        public DateTime EndDate { get; set; }

        public EstateType Type { get; set; }
        public EstateStatus Status { get; set; }       
        public Currency Currency { get; set; }

        public Location Location { get; set; }
        public int OwnerId { get; set; }

        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    }
}
