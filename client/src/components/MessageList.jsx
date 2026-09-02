import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
        <p>No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => {
        const isOwnMessage = msg.sender._id === currentUserId;
        return (
          <div 
            key={msg._id || index} 
            className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
          >
            <span className="text-xs text-gray-500 mb-1 ml-1 mr-1">
              {msg.sender.username} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div 
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                isOwnMessage 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
