
namespace Ecoture.Models.Entity
{
	public class Content
	{
		public int ContentId { get; set; }
		public int PreferencesId { get; set; }
		public bool Membership { get; set; }

		public string ContentTitle { get; set; } = string.Empty;

        public List<int> ProductIds { get; set; } = new();
	}
}
