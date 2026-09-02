import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RoomList from '../components/RoomList';
import RoomDetails from '../components/RoomDetails';
import CreateRoomModal from '../components/CreateRoomModal';

const Chat = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for rooms
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
    setSelectedRoom(newRoom);
    setIsSidebarOpen(false); // close sidebar on mobile
  };

  const handleUpdateRoom = (updatedRoom) => {
    setRooms(prev => prev.map(r => r._id === updatedRoom._id ? updatedRoom : r));
    setSelectedRoom(updatedRoom);
  };

  const handleDeleteRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r._id !== roomId));
    setSelectedRoom(null);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setIsSidebarOpen(false); // close sidebar on mobile when a room is clicked
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <header className="bg-blue-600 shadow-md flex items-center justify-between px-4 sm:px-6 py-3 z-20 shrink-0 relative">
        <div className="flex items-center">
          <button 
            className="sm:hidden mr-3 text-white p-1"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Syntecxhub Chat</h1>
            <p className="text-xs text-blue-100 hidden sm:block">Welcome, {user?.username}!</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 transition-colors border border-blue-500 shadow-sm"
        >
          Logout
        </button>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`
          absolute sm:relative z-10 h-full transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>
          <RoomList 
            rooms={rooms} 
            setRooms={setRooms}
            selectedRoom={selectedRoom}
            setSelectedRoom={handleRoomSelect}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col z-0">
          <RoomDetails 
            room={selectedRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        </div>
      </main>

      {/* Modals */}
      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
};

export default Chat;
