using AutoMapper;
using Ecoture.Model.Entity;
using Ecoture.Model.Enum;
using Ecoture.Model.DTO;
using Ecoture.Model.Request;
using Ecoture.Model.DTO;
using Ecoture.Model.Entity;

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

            // ✅ Map Product to ProductDTO
            CreateMap<Product, ProductDTO>()
                .ForMember(dest => dest.Sizes, opt => opt.MapFrom(src => src.ProductSizes.Select(ps => new ProductSizeDTO
                {
                    SizeName = ps.Size.Name,
                    StockQuantity = ps.StockQuantity
                })))
                .ForMember(dest => dest.Colors, opt => opt.MapFrom(src => src.ProductColors.Select(pc => new ProductColorDTO
                {
                    ColorName = pc.Color.Name
                })))
                .ReverseMap(); // Enables two-way mapping

            // ✅ Map ProductSize to ProductSizeDTO
            CreateMap<ProductSize, ProductSizeDTO>()
                .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size.Name))
                .ReverseMap(); // Enables two-way mapping

            // ✅ Map ProductColor to ProductColorDTO
            CreateMap<ProductColor, ProductColorDTO>()
                .ForMember(dest => dest.ColorName, opt => opt.MapFrom(src => src.Color.Name))
                .ReverseMap(); // Enables two-way mapping

            // ✅ Map User to UserDTO
            CreateMap<User, UserDTO>().ReverseMap();

            // ✅ Map User to UserBasicDTO
            CreateMap<User, UserBasicDTO>().ReverseMap();

            // ✅ Map Address to AddressDTO
            CreateMap<Address, AddressDTO>().ReverseMap();

            // ✅ Map AddProductRequest to Product (For Creating Products)
            CreateMap<AddProductRequest, Product>()
                .ForMember(dest => dest.ProductSizes, opt => opt.Ignore()) // Sizes are handled separately
                .ForMember(dest => dest.ProductColors, opt => opt.Ignore()) // Colors are handled separately
                .ReverseMap();

            // ✅ Map UpdateProductRequest to Product (For Updating Products)
            CreateMap<UpdateProductRequest, Product>()
                .ForMember(dest => dest.ProductSizes, opt => opt.Ignore()) // Sizes are handled separately
                .ForMember(dest => dest.ProductColors, opt => opt.Ignore()) // Colors are handled separately
                .ReverseMap();
        }
    }
}
