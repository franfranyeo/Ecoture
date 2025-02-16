import React, { useContext, useEffect, useRef, useState } from "react";
import UserContext from "contexts/UserContext";
import * as signalR from "@microsoft/signalr";
import "./Chat.css";

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const { user } = useContext(UserContext);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);

    const getUserId = () => {
        if (user) {
            return `${user.firstName} ${user.lastName}`.trim();
        }
        let storedGuestId = localStorage.getItem("chatUserId");
        if (storedGuestId) return storedGuestId;
        const newGuestId = `Guest ${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem("chatUserId", newGuestId);
        return newGuestId;
    };

    const [currentUserId, setCurrentUserId] = useState(getUserId());

    useEffect(() => {
        const newUserId = getUserId();
        if (currentUserId !== newUserId) {
            console.log(`🔄 User switched: ${currentUserId} → ${newUserId}`);
            if (connection) {
                connection.send("DisconnectUser", currentUserId)
                    .then(() => console.log(`📢 Disconnected from server as ${currentUserId}`))
                    .catch(err => console.error("⚠️ Error notifying server about disconnection:", err));
                connection.stop().then(() => {
                    console.log("🔴 Previous connection stopped");
                    setConnection(null);
                    setMessages([]);
                    localStorage.removeItem(`chatMessages_${currentUserId}`);
                    setCurrentUserId(newUserId);
                    setupConnection(newUserId);
                });
            } else {
                setMessages([]);
                localStorage.removeItem(`chatMessages_${currentUserId}`);
                setCurrentUserId(newUserId);
                setupConnection(newUserId);
            }
        }
    }, [user]);

    const setupConnection = async (userId) => {
        if (connection) {
            await connection.stop();
            console.log("🔴 Stopped previous connection before new setup");
        }
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_BASE_URL}/chatHub?username=${userId}`, {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();

        try {
            await newConnection.start();
            console.log(`🟢 Connected as ${userId}`);
            const savedMessages = JSON.parse(localStorage.getItem(`chatMessages_${userId}`)) || [];
            setMessages(Array.isArray(savedMessages) ? savedMessages : []);

            newConnection.off("ReceiveMessage");
            newConnection.off("Connections");

            newConnection.on("ReceiveMessage", (senderId, receivedMessage) => {
                if (senderId !== "System") {
                    setMessages(prevMessages => {
                        const isDuplicate = prevMessages.some(
                            msg => msg.userId === senderId && msg.message === receivedMessage
                        );
                        if (!isDuplicate) {
                            const updatedMessages = [...prevMessages, { userId: senderId, message: receivedMessage }];
                            localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(updatedMessages));
                            return updatedMessages;
                        }
                        return prevMessages;
                    });
                }
            });

            newConnection.on("Connections", (connections) => {
                console.log("Updated connected users:", connections);
                setConnectedUsers(connections);
            });

            setConnection(newConnection);
        } catch (error) {
            console.error("⚠️ Error connecting to SignalR:", error);
        }
    };

    const chatBoxRef = useRef(null);
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        setupConnection(currentUserId);
        return () => {
            if (connection) {
                console.log("🔴 Cleaning up connection");
                connection.off("ReceiveMessage");
                connection.off("Connections");
                connection.stop().catch(err => console.error("⚠️ Error stopping connection:", err));
            }
        };
    }, []);

    const sendMessage = async () => {
        if (connection && message.trim() !== "") {
            await connection.send("SendMessage", currentUserId, message);
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, { userId: currentUserId, message }];
                localStorage.setItem(`chatMessages_${currentUserId}`, JSON.stringify(updatedMessages));
                return updatedMessages;
            });
            setMessage("");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box" ref={chatBoxRef}>
                {messages
                    .filter(
                        msg =>
                            msg.userId === currentUserId ||
                            msg.userId === "Admin"
                    )
                    .map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.userId === currentUserId ? "sent" : "received"}`}
                        >
                            <strong>
                                {msg.userId && msg.userId.startsWith("Guest") ? "Guest" : msg.userId}:
                            </strong>{" "}
                            {msg.message}
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
