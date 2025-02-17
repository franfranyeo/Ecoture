using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
	public class Newsletter
	{
		[Key]
		public int IssueId { get; set; }

		[Required, MaxLength(200)]
		public string IssueTitle { get; set; } = string.Empty;

		public int ContentId { get; set; }
		public DateTime DateCreated { get; set; }

		[MaxLength(40)]
		public string NewsletterCategory { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
		public string HTML {  get; set; } = string.Empty;
    }
}
