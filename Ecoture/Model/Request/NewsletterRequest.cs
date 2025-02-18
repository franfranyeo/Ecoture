namespace Ecoture.Model.Request
{
    public class NewsletterRequest
    {
        public List<string> RecipientEmails { get; set; }
        public string Subject { get; set; }
        public string Template { get; set; }
    }

}
