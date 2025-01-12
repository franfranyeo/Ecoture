using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using System;
using Ecoture;

namespace EcotureAPI.Services
{
    public class SmsService : ISmsService
    {
        private readonly IConfiguration _configuration;

        private readonly string AccountSid;
        private readonly string AuthToken;
        private readonly string TwilioPhoneNumber;

        public SmsService(IConfiguration configuration)
        {
            _configuration = configuration;
            AccountSid = _configuration["Twilio:AccountSid"];  // Your Twilio Account SID
            AuthToken = _configuration["Twilio:AuthToken"];    // Your Twilio Auth Token
            TwilioPhoneNumber = _configuration["Twilio:PhoneNumber"]; // Your Twilio phone number
        }

        // Send OTP via SMS
        public string SendOtp(string toPhoneNumber, string otp)
        {
            TwilioClient.Init(AccountSid, AuthToken);

            try
            {
                var message = MessageResource.Create(
                    body: $"Your Ecoture OTP is: {otp}",
                    from: new PhoneNumber(TwilioPhoneNumber),
                    to: new PhoneNumber(toPhoneNumber)
                );

                return "Sent OTP";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending SMS: {ex.Message}");
                return "Failed to send otp";
            }
        }
    }

    public interface ISmsService
    {
        string SendOtp(string toPhoneNumber, string otp);
    }

}
