using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Model.Entity
{
	public class Content
	{
		[Key]
		public int ContentId { get; set; }
		public int PreferencesId { get; set; }
		public bool Membership { get; set; }

		public string ContentTitle { get; set; } = string.Empty;

        public List<int> ProductIds { get; set; } = new();

		// public ICollection<Newsletter> Newsletters { get; set; }
	}
}
