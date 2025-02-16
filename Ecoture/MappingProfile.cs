using AutoMapper;
using Ecoture.Model.Entity;
using Ecoture.Model.Enum;
using Ecoture.Model.DTO;
using Ecoture.Model.Request;
using System.Linq;

namespace Ecoture
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ✅ Map Enquiry & Response
            CreateMap<Enquiry, EnquiryDTO>();
            CreateMap<Response, ResponseDTO>()
                .ForMember(dest => dest.Subject, opt => opt.MapFrom(src => src.Enquiry.subject));

            // ✅ Map Cart & Orders
            CreateMap<Cart, CartDTO>().ReverseMap();
            CreateMap<AddToCartRequest, Cart>().ReverseMap();
            CreateMap<Order, OrderDTO>()
                .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems));
            CreateMap<OrderItem, OrderItemDTO>();

            // ✅ Map Product to ProductDTO
            CreateMap<Product, ProductDTO>()
                .ForMember(dest => dest.SizeColors, opt => opt.MapFrom(src => src.ProductSizeColors
                    .Select(psc => new ProductSizeColorDTO
                    {
                        SizeName = psc.Size.Name,
                        ColorName = psc.Color.Name,
                        StockQuantity = psc.StockQuantity
                    })))
                .ForMember(dest => dest.Fits, opt => opt.MapFrom(src => src.ProductFits
                    .Select(pf => new FitDTO
                    {
                        FitName = pf.Fit.Name
                    })))
                .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => src.ProductCategories
                    .Select(pc => new CategoryDTO
                    {
                        CategoryName = pc.Category.Name
                    })))
                .ReverseMap();

            // ✅ Map ProductSizeColor to ProductSizeColorDTO
            CreateMap<ProductSizeColor, ProductSizeColorDTO>()
                .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size.Name))
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
                .ForMember(dest => dest.ProductSizeColors, opt => opt.Ignore()) // ✅ Sizes & Colors handled separately
                .ForMember(dest => dest.ProductFits, opt => opt.Ignore()) // ✅ Ignore fits (handled in ProductController)
                .ForMember(dest => dest.ProductCategories, opt => opt.Ignore()) // ✅ Ignore categories (handled in ProductController)
                .ReverseMap();

            // ✅ Map UpdateProductRequest to Product (For Updating Products)
            CreateMap<UpdateProductRequest, Product>()
                .ForMember(dest => dest.ProductSizeColors, opt => opt.Ignore()) // ✅ Sizes & Colors handled separately
                .ForMember(dest => dest.ProductFits, opt => opt.Ignore()) // ✅ Ignore fits (handled in ProductController)
                .ForMember(dest => dest.ProductCategories, opt => opt.Ignore()) // ✅ Ignore categories (handled in ProductController)
                .ReverseMap();

            // ✅ Map SizeColorRequest to ProductSizeColor (For handling size and color mapping)
            CreateMap<SizeColorRequest, ProductSizeColor>()
                .ForMember(dest => dest.SizeId, opt => opt.Ignore()) // Ensure size lookup is handled
                .ForMember(dest => dest.ColorId, opt => opt.Ignore()) // Ensure color lookup is handled
                .ReverseMap();

            CreateMap<Wishlist, WishlistDTO>()
    .ForMember(dest => dest.ProductTitle, opt => opt.MapFrom(src => src.Product.Title))
    .ForMember(dest => dest.ProductImage, opt => opt.MapFrom(src => src.Product.ImageFile))
    .ForMember(dest => dest.ProductPrice, opt => opt.MapFrom(src => src.Product.Price))
    .ReverseMap();


            // ✅ Map Order to OrderDTO
            CreateMap<Order, OrderDTO>()
                .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems)); // Map collection explicitly

            // ✅ Map OrderItem to OrderItemDTO
            CreateMap<OrderItem, OrderItemDTO>();
        }
    }
}
