using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.Request
{
	public class AddResponse
	{
		[Required]
		public int EnquiryId { get; set; } // ID of the associated enquiry

		[Required]
		[MaxLength(1000)]
		public string Message { get; set; } = string.Empty; // Response message
	}
}
