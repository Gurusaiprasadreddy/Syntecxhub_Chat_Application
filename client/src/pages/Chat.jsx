import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Syntecxhub Chat</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.username}!</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You are Authenticated!</h2>
          <p className="text-gray-600 max-w-md">
            This is a protected page. Real-time messaging, chat rooms, and Socket.io features will be implemented in the next phases.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Chat;
