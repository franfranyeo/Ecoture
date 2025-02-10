namespace Ecoture.Models.DTO
{
	public class ContentDto
	{
		public int ContentId { get; set; }
		public int PreferencesId { get; set; }
		public string ContentTitle { get; set; } = string.Empty;
        public bool Membership { get; set; }
		public List<int> ProductIds { get; set; } = new();
	}
}
