using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecoture.Models.Entity
{
	public class Content
	{
		[Key]
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int ContentId { get; set; }

		public int ProductId { get; set; }
		public int PreferencesId { get; set; }
		public int ContentData { get; set; }
		public bool Membership { get; set; }
	}
}
