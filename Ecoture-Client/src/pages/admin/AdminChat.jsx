import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import './AdminChat.css';

const AdminChat = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState('');
  const [user] = useState('Admin');
  const [targetUser, setTargetUser] = useState('');
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('adminChatUsers')) || [];
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/chatHub?username=${user}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => console.log('✅ Admin Connected to SignalR'))
      .catch((err) => console.error('⚠️ Connection error:', err));

    newConnection.on('ReceiveMessage', (sender, receivedMessage) => {
      const timestamp = new Date();
      setMessages((prevMessages) => {
        const updatedMessages = {
          ...prevMessages,
          [sender]: [
            ...(prevMessages[sender] || []),
            { user: sender, message: receivedMessage, timestamp },
          ],
        };
        localStorage.setItem(
          `chatMessages_${sender}`,
          JSON.stringify(updatedMessages[sender])
        );
        return updatedMessages;
      });

      setUsers((prevUsers) => {
        if (!prevUsers.includes(sender)) {
          const updatedUsers = [...prevUsers, sender];
          localStorage.setItem('adminChatUsers', JSON.stringify(updatedUsers));
          return updatedUsers;
        }
        return prevUsers;
      });

      if (targetUser !== sender) {
        setUnreadCounts((prev) => ({
          ...prev,
          [sender]: (prev[sender] || 0) + 1,
        }));
      }
    });

    setConnection(newConnection);

    return () => {
      newConnection.off('ReceiveMessage');
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop().catch((err) =>
          console.error('⚠️ Error stopping connection:', err)
        );
      }
    };
  }, [targetUser, user]);

  useEffect(() => {
    if (!connection) return;

    const connectionsHandler = (connections) => {
      console.log('🔄 Online Users:', connections);
      setOnlineUsers(connections);
    };

    connection.on('Connections', connectionsHandler);
    return () => {
      connection.off('Connections', connectionsHandler);
    };
  }, [connection]);

  const sendMessage = async () => {
    if (connection && targetUser.trim() !== '') {
      await connection.send('SendMessageToUser', targetUser, user, message);
      const timestamp = new Date();
      setMessages((prevMessages) => ({
        ...prevMessages,
        [targetUser]: [
          ...(prevMessages[targetUser] || []),
          { user, message, timestamp },
        ],
      }));
      setMessage('');
    } else {
      alert('⚠️ Please select a user to reply to.');
    }
  };

  const handleUserSelect = (usr) => {
    setTargetUser(usr);
    setUnreadCounts((prev) => ({
      ...prev,
      [usr]: 0,
    }));
  };

  const deleteChat = (usr) => {
    if (window.confirm(`Are you sure you want to delete chat history for ${usr}?`)) {
      localStorage.removeItem(`chatMessages_${usr}`);

      const updatedUsers = users.filter((u) => u !== usr);
      localStorage.setItem('adminChatUsers', JSON.stringify(updatedUsers));

      setUsers(updatedUsers);
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        delete updatedMessages[usr];
        return updatedMessages;
      });

      if (targetUser === usr) {
        setTargetUser('');
      }

      console.log(`🗑️ Deleted chat history for ${usr}`);
    }
  };

  const chatBoxRef = useRef(null);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="admin-chat-container">
      <div className="sidebar">
        <h3>Connected Users</h3>
        {onlineUsers
          .filter(usr => usr !== 'Admin' && usr !== 'System')
          .map((usr, index) => (
            <div
              key={index}
              className={`user-item ${targetUser === usr ? 'active' : ''}`}
              onClick={() => handleUserSelect(usr)}
            >
              {usr}
              {unreadCounts[usr] > 0 && (
                <span className="new-badge">{unreadCounts[usr]}</span>
              )}
            </div>
          ))
        }

        <h3>Disconnected Chats</h3>
        {users
          .filter((usr) =>
            !onlineUsers.includes(usr) &&
            usr !== 'Admin' &&
            usr !== 'System'
          )
          .map((usr, index) => (
            <div key={index} className="user-item">
              <span
                className={`user-label ${targetUser === usr ? 'active' : ''}`}
                onClick={() => handleUserSelect(usr)}
              >
                {usr} (offline)
                {unreadCounts[usr] > 0 && (
                  <span className="new-badge">{unreadCounts[usr]}</span>
                )}
              </span>
              <span className="delete-icon" onClick={() => deleteChat(usr)}> ❌</span>
            </div>
          ))
        }
      </div>

      {!targetUser ? (
        <div className="chat-placeholder">
          <p>Select a chat to view messages</p>
        </div>
      ) : (
        <div className="chat-window" >
          <h3>Chat with {targetUser}</h3>
          <div className="chat-messages">
            {(messages[targetUser] || []).map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${msg.user === 'Admin' ? 'admin' : 'user'}`}
              >
                <strong>{msg.user}</strong>
                <br />
                <span className="message-text">{msg.message}</span>
                <div className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
          {onlineUsers.includes(targetUser) ? (
            <div className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          ) : (

            <div className="chat-input offline-note">
              <span style={{ color: 'red', marginRight: '5px', fontSize: '1.1rem' }}>❗</span>
              The user is no longer online, you can't reply to this user.
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminChat;
