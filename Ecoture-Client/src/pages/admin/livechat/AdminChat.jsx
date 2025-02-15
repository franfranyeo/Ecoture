import { useEffect, useState } from 'react';

import * as signalR from '@microsoft/signalr';

import './AdminChat.css';

const AdminChat = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user] = useState('Admin');
  const [targetUser, setTargetUser] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedMessages = localStorage.getItem('adminChatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `${import.meta.env.VITE_API_BASE_URL}/chatHub?username=${user}`,
        {
          withCredentials: true,
        }
      )
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => console.log('Admin Connected to SignalR'))
      .catch((err) => console.error('Connection error:', err));

    // Event listener function
    const receiveMessageHandler = (sender, receivedMessage) => {
      setMessages((prevMessages) => {
        // Check if the message already exists before adding it
        const isDuplicate = prevMessages.some(
          (msg) => msg.user === sender && msg.message === receivedMessage
        );
        if (!isDuplicate) {
          const updatedMessages = [
            ...prevMessages,
            { user: sender, message: receivedMessage },
          ];
          localStorage.setItem(
            'adminChatMessages',
            JSON.stringify(updatedMessages)
          );
          return updatedMessages;
        }
        return prevMessages;
      });

      setUsers((prevUsers) => {
        return prevUsers.includes(sender) ? prevUsers : [...prevUsers, sender];
      });
    };

    // Attach event listener
    newConnection.on('ReceiveMessage', receiveMessageHandler);

    setConnection(newConnection);

    return () => {
      newConnection.off('ReceiveMessage', receiveMessageHandler);
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection
          .stop()
          .catch((err) => console.error('Error stopping connection:', err));
      }
    };
  }, []);

  useEffect(() => {
    if (!connection) return;

    const userConnectedHandler = (userId) => {
      setUsers((prevUsers) =>
        prevUsers.includes(userId) ? prevUsers : [...prevUsers, userId]
      );
    };

    connection.on('UserConnected', userConnectedHandler);

    return () => {
      connection.off('UserConnected', userConnectedHandler);
    };
  }, [connection]);

  const sendMessage = async () => {
    if (connection && targetUser.trim() !== '') {
      await connection.send('SendMessageToUser', targetUser, user, message);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, { user, message }];
        localStorage.setItem(
          'adminChatMessages',
          JSON.stringify(updatedMessages)
        );
        return updatedMessages;
      });
      setMessage('');
    } else {
      alert('Please select a user to reply to.');
    }
  };

  return (
    <div className="admin-chat-container">
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
      <div className="chat-window">
        <h3>Chat {targetUser && `(Chatting with ${targetUser})`}</h3>
        <div className="chat-messages">
          {messages
            .filter((msg) => msg.user === targetUser || msg.user === 'Admin')
            .map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${msg.user === 'Admin' ? 'admin' : 'user'}`}
              >
                <strong>{msg.user}:</strong> {msg.message}
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
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
