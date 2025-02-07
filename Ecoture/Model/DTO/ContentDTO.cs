namespace Ecoture.Model.DTO
{
	public class ContentDto
	{
		public int ContentId { get; set; }
		public int PreferencesId { get; set; }
		public bool Membership { get; set; }
		public List<int> ProductIds { get; set; } = new();
	}
}
