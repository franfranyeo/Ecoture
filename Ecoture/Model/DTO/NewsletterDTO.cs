using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.DTO
{
	public class NewsletterDto
	{
		public int IssueId { get; set; }
		public string IssueTitle { get; set; } = string.Empty;
		public int ContentId { get; set; }
		public DateTime DateCreated { get; set; }
		public string NewsletterCategory { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
		public string HTML {  get; set; } = string.Empty;
    }
}
