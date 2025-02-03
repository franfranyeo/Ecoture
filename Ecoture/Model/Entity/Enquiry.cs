using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Ecoture.Models.Enum;

namespace Ecoture.Models.Entity
{
	public class Enquiry
	{
		public int enquiryId { get; set; }

		public int? userId { get; set; }

		[Required]
		[MaxLength(255)]
		public string email { get; set; } = string.Empty; 

		[Required]
		[MaxLength(255)]
		public string subject { get; set; } = string.Empty; 

		[Required]
		public string message { get; set; } = string.Empty;

		public EnquiryStatus status { get; set; } = EnquiryStatus.Open; 

		[Column(TypeName = "datetime")]
		public DateTime createdAt { get; set; } 

		[Column(TypeName = "datetime")]
		public DateTime updatedAt { get; set; } 

		[JsonIgnore]
		public ICollection<Response>? Responses { get; set; } 
	}

}
