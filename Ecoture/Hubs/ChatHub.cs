using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ecoture.Hubs
{
    public class ChatHub : Hub
    {
        private static Dictionary<string, string> userConnections = new Dictionary<string, string>();

        public override async Task OnConnectedAsync()
        {
            string userId = Context.ConnectionId; // Use Connection ID as default
            if (Context.GetHttpContext().Request.Query.ContainsKey("username"))
            {
                userId = Context.GetHttpContext().Request.Query["username"];
            }

            userConnections[userId] = Context.ConnectionId;

            await Clients.Others.SendAsync("ReceiveMessage", "System", $"{userId} connected");
            await Clients.Others.SendAsync("Connections", userConnections.Keys);

            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.Others.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendMessageToUser(string targetUser, string sender, string message)
        {
            if (userConnections.TryGetValue(targetUser, out string connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceiveMessage", sender, message);
            }
            else
            {
                // If the user is not connected, notify the admin
                await Clients.Caller.SendAsync("ReceiveMessage", "System", $"User {targetUser} is not online.");
            }
        }

        public override async Task OnDisconnectedAsync(System.Exception exception)
        {
            var user = userConnections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
            if (user != null)
            {
                userConnections.Remove(user);
                await Clients.Others.SendAsync("ReceiveMessage", "System", $"{user} disconnected");
                await Clients.Others.SendAsync("Connections", userConnections.Keys);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
