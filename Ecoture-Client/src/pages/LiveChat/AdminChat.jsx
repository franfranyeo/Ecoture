import { useEffect, useState } from 'react';

import * as signalR from '@microsoft/signalr';

import './AdminChat.css';

const AdminChat = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('Admin');
  const [targetUser, setTargetUser] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedMessages =
      JSON.parse(localStorage.getItem('adminChatMessages')) || [];
    setMessages(storedMessages);

    const storedUsers =
      JSON.parse(localStorage.getItem('adminChatUsers')) || [];
    setUsers(storedUsers);
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

    const receiveMessageHandler = (sender, receivedMessage) => {
      setMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          { user: sender, message: receivedMessage },
        ];
        localStorage.setItem(
          'adminChatMessages',
          JSON.stringify(updatedMessages)
        ); // Persist messages
        return updatedMessages;
      });

      setUsers((prevUsers) => {
        if (!prevUsers.includes(sender)) {
          const updatedUsers = [...prevUsers, sender];
          localStorage.setItem('adminChatUsers', JSON.stringify(updatedUsers)); // Persist users
          return updatedUsers;
        }
        return prevUsers;
      });

      // Mark message as unread
      let unreadChats = JSON.parse(localStorage.getItem('unreadChats')) || {};
      unreadChats[sender] = true;
      localStorage.setItem('unreadChats', JSON.stringify(unreadChats));
    };

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
      setUsers((prevUsers) => {
        if (!prevUsers.includes(userId)) {
          const updatedUsers = [...prevUsers, userId];
          localStorage.setItem('adminChatUsers', JSON.stringify(updatedUsers)); // Persist users
          return updatedUsers;
        }
        return prevUsers;
      });
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
        {users.length === 0 ? (
          <p className="no-users">No users available</p>
        ) : (
          users.map((usr, index) => {
            const unreadChats =
              JSON.parse(localStorage.getItem('unreadChats')) || {};
            const isNew = unreadChats[usr];

            return (
              <div
                key={index}
                className={`user-item ${targetUser === usr ? 'active' : ''}`}
                onClick={() => {
                  setTargetUser(usr);
                  unreadChats[usr] = false; // Mark chat as read when clicked
                  localStorage.setItem(
                    'unreadChats',
                    JSON.stringify(unreadChats)
                  );
                }}
              >
                {usr} {isNew && <span className="new-badge">New</span>}
              </div>
            );
          })
        )}
      </div>

      {/* Show message if no chat is selected */}
      {!targetUser ? (
        <div className="chat-placeholder">
          <p>Select a chat to view messages</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default AdminChat;
