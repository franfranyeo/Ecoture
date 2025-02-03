namespace Ecoture.Models.DTO
{
    public class CreditCardDTO
    {
        public int Id { get; set; }
        public string CardHolderName { get; set; } = string.Empty;
        public string LastFourDigits { get; set; } = string.Empty; // Derived from CardNumber
        public int ExpiryMonth { get; set; }
        public int ExpiryYear { get; set; }
    }
}
