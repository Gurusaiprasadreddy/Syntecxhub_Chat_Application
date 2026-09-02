import React, { useState } from 'react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSend} className="flex space-x-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a message... (Shift+Enter for newline)"
          className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 resize-none h-11"
          rows="1"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`px-5 py-2 text-white font-medium rounded-lg text-sm ${
            disabled || !message.trim()
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
