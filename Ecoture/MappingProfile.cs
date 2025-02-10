using AutoMapper;
using Ecoture.Models.Entity;
using Ecoture.Models;
using Ecoture.Models.Enum;
using Ecoture.Models.DTO;
using Ecoture.Models.Request;
using System.Linq;
using Ecoture.Model.DTO;

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

            CreateMap<Cart, CartDTO>().ReverseMap();
            CreateMap<AddToCartRequest, Cart>().ReverseMap();

            CreateMap<Order, OrderDTO>()
            .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems));

            // Map OrderItem to OrderItemDTO
            CreateMap<OrderItem, OrderItemDTO>();

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
                .ForMember(dest => dest.Fits, opt => opt.MapFrom(src => src.ProductFits.Select(pf => new FitDTO
                {
                    FitName = pf.Fit.Name
                })))
                .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => src.ProductCategories.Select(pc => new CategoryDTO
                {
                    
                    CategoryName = pc.Category.Name
                })))
                .ReverseMap();

            // ✅ Map ProductSize to ProductSizeDTO
            CreateMap<ProductSize, ProductSizeDTO>()
                .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size.Name))
                .ReverseMap();

            // ✅ Map ProductColor to ProductColorDTO
            CreateMap<ProductColor, ProductColorDTO>()
                .ForMember(dest => dest.ColorName, opt => opt.MapFrom(src => src.Color.Name))
                .ReverseMap();

            // ✅ Map ProductFit to FitDTO
            CreateMap<ProductFit, FitDTO>()
                
                .ForMember(dest => dest.FitName, opt => opt.MapFrom(src => src.Fit.Name))
                .ReverseMap();

            // ✅ Map ProductCategory to CategoryDTO
            CreateMap<ProductCategory, CategoryDTO>()
                
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ReverseMap();

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
                .ForMember(dest => dest.ProductFits, opt => opt.Ignore()) // ✅ Ignore fits (handled in ProductController)
                .ForMember(dest => dest.ProductCategories, opt => opt.Ignore()) // ✅ Ignore categories (handled in ProductController)
                .ReverseMap();

            // ✅ Map UpdateProductRequest to Product (For Updating Products)
            CreateMap<UpdateProductRequest, Product>()
                .ForMember(dest => dest.ProductSizes, opt => opt.Ignore()) // Sizes are handled separately
                .ForMember(dest => dest.ProductColors, opt => opt.Ignore()) // Colors are handled separately
                .ForMember(dest => dest.ProductFits, opt => opt.Ignore()) // ✅ Ignore fits (handled in ProductController)
                .ForMember(dest => dest.ProductCategories, opt => opt.Ignore()) // ✅ Ignore categories (handled in ProductController)
                .ReverseMap();

            // ✅ Map Order to OrderDTO
            CreateMap<Order, OrderDTO>()
                .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems)); // Map collection explicitly

            // ✅ Map OrderItem to OrderItemDTO
            CreateMap<OrderItem, OrderItemDTO>();
        }
    }
}
