using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Ecoture.Models.Entity
{
	public class Response
	{
		public int responseId { get; set; } // Primary Key

		[ForeignKey("Enquiry")]
		public int enquiryId { get; set; } // Foreign Key referencing Enquiry

		[Required]
		public int csoId { get; set; } // ID of the Customer Service Officer who responded

		[JsonIgnore]
		public Enquiry? Enquiry { get; set; } // Navigation property to Enquiry

		[Required]
		public string message { get; set; } = string.Empty; // Message content of the response

		[Column(TypeName = "datetime")]
		public DateTime responseDate { get; set; } // Date and time of the response
	}
}
