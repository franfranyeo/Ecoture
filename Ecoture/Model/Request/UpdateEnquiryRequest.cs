using Ecoture.Models.Enum;
using System.ComponentModel.DataAnnotations;

namespace Ecoture.Models.Request
{
	public class UpdateEnquiryRequest
	{
		public EnquiryStatus Status { get; set; }
	}
}
