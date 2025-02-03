using AutoMapper;
using Ecoture.Models.Entity;
using Ecoture.Models;
using Ecoture.Models.Enum;
using Ecoture.Models.DTO;

namespace Ecoture
{
	public class MappingProfile : Profile
	{
		public MappingProfile()
		{
			CreateMap<Enquiry, EnquiryDTO>();
			CreateMap<Response, ResponseDTO>();
			CreateMap<Response, ResponseDTO>()
				.ForMember(dest => dest.Subject, opt => opt.MapFrom(src => src.Enquiry.subject));
			
			// Map Product to ProductDTO
			CreateMap<Product, ProductDTO>()
				.ForMember(dest => dest.Sizes, opt => opt.MapFrom(src => src.ProductSizes.Select(ps => new ProductSizeDTO
				{
					SizeName = ps.Size.Name,
					StockQuantity = ps.StockQuantity
				})))
				.ForMember(dest => dest.Colors, opt => opt.MapFrom(src => src.ProductColors.Select(pc => new ProductColorDTO
				{
					ColorName = pc.Color.Name
				})));

			// Map User to UserDTO
			CreateMap<User, UserDTO>();

			// Map User to UserBasicDTO
			CreateMap<User, UserBasicDTO>();

			// AHMED
			CreateMap<Address, AddressDTO>();
		}
	}
}
