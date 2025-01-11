using System.Net.Mail;
using System.Net;

namespace EcotureAPI.Services
{
    public class EmailService : IEmailService
    {
        public readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public Task SendAsync(string to, string subject, string body)
        {
            // Simulate sending email (use SMTP or a service like SendGrid in production)
            var sender = _configuration["Email:SenderEmail"];
            var passwd = _configuration["Email:SenderPassword"];

            SmtpClient client = new("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Credentials = new NetworkCredential(sender, passwd)
            };
            // Create the email message
            var mailMessage = new MailMessage(sender, to, subject, body)
            {
                IsBodyHtml = true // Set this to true to indicate that the body is HTML
            };

            // You can also add custom HTML formatting here
            string htmlBody = $"<html><body><h2>{subject}</h2><p>{body}</p></body></html>";
            mailMessage.Body = htmlBody;

            // Log the email details (for debugging)
            Console.WriteLine($"Email sent to {to}: {subject} \n{htmlBody}");

            return client.SendMailAsync(mailMessage);
        }
    }

    public interface IEmailService
    {
        Task SendAsync(string to, string subject, string body);
    }
}
