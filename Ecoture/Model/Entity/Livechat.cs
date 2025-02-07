namespace Ecoture.Model.Entity
{
	public class Livechat
	{
		public int chatSessionId { get; set; }

		public int? userId { get; set; }



		public DateTime? startedAt { get; set; }
		public DateTime? endedAt { get; set; }

	}
}
