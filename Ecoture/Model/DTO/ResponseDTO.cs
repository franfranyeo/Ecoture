namespace Ecoture.Models.DTO
{
	public class ResponseDTO
	{
		public int ResponseId { get; set; }
		public string Message { get; set; } = string.Empty;
		public DateTime ResponseDate { get; set; }
		public int EnquiryId { get; set; }
		public string Subject { get; set; } = string.Empty;
	}
}
