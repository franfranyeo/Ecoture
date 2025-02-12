using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Ecoture.Model.Entity
{
	public class Response
	{
		public int responseId { get; set; } 

		public int enquiryId { get; set; } 

		[Required]
		public int csoId { get; set; } 

		[JsonIgnore]
		public Enquiry? Enquiry { get; set; } 

		[Required]
		public string message { get; set; } = string.Empty; 

		[Column(TypeName = "datetime")]
		public DateTime responseDate { get; set; } 
	}
}
