using System.ComponentModel.DataAnnotations;

namespace EcotureAPI.Models.DTO
{
	public class NewsletterDto
	{
		public int IssueId { get; set; }
		public string IssueTitle { get; set; } = string.Empty;
		public int ContentId { get; set; }
		public DateTime DateSent { get; set; }
		public string NewsletterCategory { get; set; } = string.Empty;
		
		[MinLength(1)]
		public List<int> ContentIds { get; set; } = new();
	}
}
