import React, { useState } from 'react';
import Chat from '../pages/LiveChat/Chat';

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#0056b3',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '50px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            fontFamily: 'inherit',
          }}
        >
          💬 Chat with Us
        </button>
      )}

      {/* Always mount Chat, but hide it when closed */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: '20px',
          width: '420px',
          height: '480px',
          backgroundColor: 'white',
          boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
          borderRadius: '10px',
          display: isChatOpen ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: '#180D3B',
            color: 'white',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          Live Chat
          <button
            onClick={() => setIsChatOpen(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ✖
          </button>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
