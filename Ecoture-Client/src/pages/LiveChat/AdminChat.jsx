import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import "./AdminChat.css"; // Ensure you create a matching CSS file

const AdminChat = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState("Admin"); // Admin user identifier
    const [targetUser, setTargetUser] = useState(""); // User to reply to
    const [users, setUsers] = useState([]); // List of users to chat with

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_BASE_URL}/chatHub?username=${user}`, {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();
    
        newConnection.start()
            .then(() => console.log("Admin Connected to SignalR"))
            .catch(err => console.error("Connection error:", err));
    
        // Prevent multiple event listeners
        newConnection.off("ReceiveMessage");
    
        newConnection.on("ReceiveMessage", (sender, receivedMessage) => {
            setMessages(prevMessages => {
                // Avoid duplicate messages
                if (prevMessages.some(msg => msg.user === sender && msg.message === receivedMessage)) {
                    return prevMessages; // Do not add duplicate messages
                }
                return [...prevMessages, { user: sender, message: receivedMessage }];
            });
    
            setUsers(prevUsers => {
                return prevUsers.includes(sender) ? prevUsers : [...prevUsers, sender]; 
            });
        });
    
        setConnection(newConnection);
    
        return () => {
            if (newConnection.state === signalR.HubConnectionState.Connected) {
                newConnection.stop().catch(err => console.error("Error stopping connection:", err));
            }
        };
    }, []);
    
    useEffect(() => {
        if (!connection) return;
    
        connection.on("UserConnected", (userId) => {
            setUsers(prevUsers => {
                // Prevent duplicate users
                return prevUsers.includes(userId) ? prevUsers : [...prevUsers, userId];
            });
        });
    
        return () => {
            connection.off("UserConnected");
        };
    }, [connection]);

    const sendMessage = async () => {
        if (connection && targetUser.trim() !== "") {
            await connection.send("SendMessageToUser", targetUser, user, message);
    
            // Add the message only if it is not a duplicate
            setMessages(prevMessages => {
                if (prevMessages.some(msg => msg.user === user && msg.message === message)) {
                    return prevMessages; // Prevent duplicate messages
                }
                return [...prevMessages, { user, message }];
            });
    
            setMessage(""); // Clear input field after sending
        } else {
            alert("Please select a user to reply to.");
        }
    };
    

    return (
        <div className="admin-chat-container">
            {/* Sidebar for users */}
            <div className="sidebar">
                <h3>Users</h3>
                {users.map((usr, index) => (
                    <div 
                        key={index} 
                        className={`user-item ${targetUser === usr ? 'active' : ''}`} 
                        onClick={() => setTargetUser(usr)}
                    >
                        {usr}
                    </div>
                ))}
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                <h3>Chat {targetUser && `(Chatting with ${targetUser})`}</h3>
                <div className="chat-messages">
                    {messages
                        .filter(msg => msg.user === targetUser || msg.user === "Admin")
                        .map((msg, index) => (
                        <div key={index} className={`chat-bubble ${msg.user === "Admin" ? "admin" : "user"}`}>
                            <strong>{msg.user}:</strong> {msg.message}
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                <div className="chat-input">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
