import React, { useContext, useEffect, useState } from "react";
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
            localStorage.setItem("user", JSON.stringify(user));
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
        if (user) {
            localStorage.removeItem("chatUserId");
            const realName = `${user.firstName} ${user.lastName}`.trim();
            if (currentUserId.startsWith("Guest") || currentUserId !== realName) {
                console.log(`Replacing guest ID (“${currentUserId}”) with real user ID (“${realName}”).`);
                setCurrentUserId(realName);
            }
        }
    }, [user, currentUserId]);

    useEffect(() => {
        const newUserId = getUserId();
        if (currentUserId !== newUserId) {
            console.log(`🔄 User switched: ${currentUserId} → ${newUserId}`);
            disconnectCurrentUser().then(() => {
                cleanupAndReconnect(newUserId);
            });
        }
    }, [user, currentUserId]);

    const disconnectCurrentUser = async () => {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            try {
                console.log("🛑 Stopping connection...");
                setConnection(null);
                await connection.send("DisconnectUser", currentUserId); // Notify server
                await connection.stop();
                console.log("🔴 Connection stopped successfully");
                setConnectedUsers((prev) => prev.filter((u) => u !== currentUserId));
            } catch (err) {
                console.error("⚠️ Error stopping connection:", err);
            }
        }
    };

    const cleanupAndReconnect = async (newUserId) => {
        setMessages([]);
        localStorage.removeItem(`chatMessages_${currentUserId}`);
        setCurrentUserId(newUserId);
        await setupConnection(newUserId);
    };

    const setupConnection = async (userId) => {
        await disconnectCurrentUser();

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_BASE_URL}/chatHub?username=${userId}`, {
                withCredentials: true,
            })
            .withAutomaticReconnect()
            .build();

        try {
            await newConnection.start();
            console.log(`🟢 Connected as ${userId}`);

            const savedMessages = JSON.parse(localStorage.getItem(`chatMessages_${userId}`)) || [];
            setMessages(Array.isArray(savedMessages) ? savedMessages : []);

            newConnection.on("ReceiveMessage", (senderId, receivedMessage) => {
                if (senderId !== "System") {
                    setMessages((prevMessages) => {
                        const isDuplicate = prevMessages.some(
                            (msg) => msg.userId === senderId && msg.message === receivedMessage
                        );
                        if (!isDuplicate) {
                            const updatedMessages = [
                                ...prevMessages,
                                { userId: senderId, message: receivedMessage, timestamp: new Date() },
                            ];
                            localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(updatedMessages));
                            return updatedMessages;
                        }
                        return prevMessages;
                    });
                }
            });

            newConnection.on("Connections", (connections) => {
                console.log("Updated connected users:", connections);
                setConnectedUsers(connections.filter((u) => u !== null));
            });

            setConnection(newConnection);
        } catch (error) {
            console.error("⚠️ Error connecting to SignalR:", error);
        }
    };

    useEffect(() => {
        setupConnection(currentUserId);
        return () => {
            disconnectCurrentUser();
        };
    }, []);

    const sendMessage = async () => {
        if (connection && message.trim() !== "") {
            const timestamp = new Date();
            await connection.send("SendMessage", currentUserId, message);
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, { userId: currentUserId, message, timestamp }];
                localStorage.setItem(`chatMessages_${currentUserId}`, JSON.stringify(updatedMessages));
                return updatedMessages;
            });
            setMessage("");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages
                    .filter((msg) => msg.userId === currentUserId || msg.userId === "Admin")
                    .map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.userId === currentUserId ? "sent" : "received"}`}
                        >
                            <strong>
                                {msg.userId && msg.userId.startsWith("Guest") ? "Guest" : msg.userId}:
                            </strong>
                            <br />
                            <span className="message-text">{msg.message}</span>

                            {/* Timestamp in bottom-right corner */}
                            {msg.timestamp && (
                                <div className="timestamp">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            )}
                        </div>
                    ))}

            </div>

            <div className="chat-input">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
                <button onClick={sendMessage} id="send-btn">Send</button>
            </div>
        </div>
    );
};

export default Chat;
