import React, { useContext, useEffect, useState } from "react";
import UserContext from "contexts/UserContext";
import * as signalR from "@microsoft/signalr";
import "./Chat.css"; // Ensure you have a corresponding CSS file for styling

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const { user } = useContext(UserContext);

    const userId = user ? `User ${user.userId}` : "Guest " + Math.floor(Math.random() * 1000)

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_BASE_URL}/chatHub?username=${userId}`, {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => console.log("User Connected to SignalR"))
            .catch(err => console.error("Connection error:", err));

        newConnection.on("ReceiveMessage", (userId, message) => {
            setMessages(prevMessages => [...prevMessages, { userId, message }]);
        });

        setConnection(newConnection);

        return () => {
            if (newConnection.state === signalR.HubConnectionState.Connected) {
                newConnection.stop().catch(err => console.error("Error stopping connection:", err));
            }
        };
    }, []);

    const sendMessage = async () => {
        if (connection && message.trim() !== "") {
            await connection.send("SendMessage", userId, message);
            setMessage(""); // Clear input after sending
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.userId === userId ? "sent" : "received"}`}>
                        <strong>{msg.userId}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="send-btn">Send</button>
            </div>
        </div>
    );
};

export default Chat;
