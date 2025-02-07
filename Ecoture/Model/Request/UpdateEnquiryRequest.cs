using Ecoture.Model.Enum;
using System.ComponentModel.DataAnnotations;

namespace Ecoture.Model.Request
{
	public class UpdateEnquiryRequest
	{
		public EnquiryStatus Status { get; set; }
	}
}
