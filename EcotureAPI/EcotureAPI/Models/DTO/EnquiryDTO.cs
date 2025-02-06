using Org.BouncyCastle.Asn1.Ocsp;

namespace EcotureAPI.Models.DTO
{
	public class EnquiryDTO
	{
		public int EnquiryId { get; set; }
		public string Email { get; set; } = string.Empty;
		public string Subject { get; set; } = string.Empty;
		public string Message { get; set; } = string.Empty;
		public string Status { get; set; } = "Open";
		public DateTime CreatedAt { get; set; }
		public DateTime UpdatedAt { get; set; }
		public List<ResponseDTO>? Responses { get; set; }
	}
}
