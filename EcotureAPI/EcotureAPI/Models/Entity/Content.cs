
namespace EcotureAPI.Models.Entity
{
	public class Content
	{
		public int ContentId { get; set; }
		public int PreferencesId { get; set; }
		public bool Membership { get; set; }

		public List<int> ProductIds { get; set; } = new();
	}
}
