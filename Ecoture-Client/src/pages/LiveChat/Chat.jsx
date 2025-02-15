import React, { useContext, useEffect, useState } from "react";
import UserContext from "contexts/UserContext";
import * as signalR from "@microsoft/signalr";
import "./Chat.css";

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const { user } = useContext(UserContext);

    const getUserId = () => {
        if (user) {
            return `${user.firstName} ${user.lastName}`;
        }

        let guestId = localStorage.getItem("chatUserId");
        if (!guestId) {
            guestId = `Guest ${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("chatUserId", guestId);
        }
        return guestId;
    };

    const [currentUserId, setCurrentUserId] = useState(getUserId());

    useEffect(() => {
        const newUserId = getUserId();
        if (currentUserId !== newUserId) {
            console.log(`🔄 User switched: ${currentUserId} → ${newUserId}`);

            if (connection) {
                connection.stop().then(() => {
                    console.log("🔴 Previous connection stopped");
                    setConnection(null); // Ensure the old connection is fully cleared
                });
            }

            setMessages([]); // Clear messages
            localStorage.removeItem(`chatMessages_${currentUserId}`); // Remove stored messages
            setCurrentUserId(newUserId);
        }
    }, [user]);

    useEffect(() => {
        let isMounted = true;

        const setupConnection = async () => {
            if (connection) {
                await connection.stop();
                console.log("🔴 Stopped previous connection before new setup");
            }

            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_API_BASE_URL}/chatHub?username=${currentUserId}`, {
                    withCredentials: true
                })
                .withAutomaticReconnect()
                .build();

            try {
                await newConnection.start();
                console.log(`🟢 Connected as ${currentUserId}`);

                newConnection.on("ReceiveMessage", (senderId, receivedMessage) => {
    // Allow messages from Admin and the current user to be received
    if (senderId === "Admin" || senderId === currentUserId) {
        setMessages(prevMessages => {
            const isDuplicate = prevMessages.some(
                msg => msg.userId === senderId && msg.message === receivedMessage
            );
            if (!isDuplicate) {
                const updatedMessages = [...prevMessages, { userId: senderId, message: receivedMessage }];
                localStorage.setItem(`chatMessages_${currentUserId}`, JSON.stringify(updatedMessages));
                return updatedMessages;
            }
            return prevMessages;
        });
    }
});


                if (isMounted) {
                    setConnection(newConnection);
                }
            } catch (error) {
                console.error("⚠️ Error connecting to SignalR:", error);
            }
        };

        setupConnection();

        return () => {
            isMounted = false;
            if (connection) {
                console.log("🔴 Cleaning up connection");
                connection.off("ReceiveMessage");
                connection.stop().catch(err => console.error("⚠️ Error stopping connection:", err));
            }
        };
    }, [currentUserId]); // ✅ Ensures proper re-initialization when user switches

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
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.userId === currentUserId ? "sent" : "received"}`}>
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
