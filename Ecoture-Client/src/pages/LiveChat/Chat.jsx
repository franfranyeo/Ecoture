import React, { useContext, useEffect, useState } from "react";
import UserContext from "contexts/UserContext";
import * as signalR from "@microsoft/signalr";
import "./Chat.css";

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const { user } = useContext(UserContext);

    // Generate a unique user identifier
    const storedUserId = localStorage.getItem("chatUserId");
    const userId = user 
        ? `${user.firstName} ${user.lastName}` 
        : storedUserId || `Guest ${Math.floor(Math.random() * 10000)}`;

    useEffect(() => {
        // Store the unique guest ID for persistence
        if (!storedUserId && !user) {
            localStorage.setItem("chatUserId", userId);
        }

        const storedMessages = localStorage.getItem("chatMessages");
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

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
    
        const receiveMessageHandler = (senderId, receivedMessage) => {
            setMessages(prevMessages => {
                const isDuplicate = prevMessages.some(msg => msg.userId === senderId && msg.message === receivedMessage);
                if (!isDuplicate) {
                    const updatedMessages = [...prevMessages, { userId: senderId, message: receivedMessage }];
                    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages)); // Persist messages
                    return updatedMessages;
                }
                return prevMessages;
            });
        };
    
        newConnection.on("ReceiveMessage", receiveMessageHandler);
        setConnection(newConnection);
    
        return () => {
            newConnection.off("ReceiveMessage", receiveMessageHandler);
            if (newConnection.state === signalR.HubConnectionState.Connected) {
                newConnection.stop().catch(err => console.error("Error stopping connection:", err));
            }
        };
    }, []);
    

    const sendMessage = async () => {
        if (connection && message.trim() !== "") {
            await connection.send("SendMessage", userId, message);
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, { userId, message }];
                localStorage.setItem("chatMessages", JSON.stringify(updatedMessages)); // Persist
                return updatedMessages;
            });
            setMessage("");
        }
    };
    

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.userId === userId ? "sent" : "received"}`}>
                        <strong>{msg.userId.startsWith("Guest") ? "Guest" : msg.userId}:</strong> {msg.message}
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
