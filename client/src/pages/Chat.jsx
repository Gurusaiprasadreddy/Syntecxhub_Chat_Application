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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
    setSelectedRoom(newRoom);
  };

  const handleUpdateRoom = (updatedRoom) => {
    setRooms(prev => prev.map(r => r._id === updatedRoom._id ? updatedRoom : r));
    setSelectedRoom(updatedRoom);
  };

  const handleDeleteRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r._id !== roomId));
    setSelectedRoom(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <header className="bg-blue-600 shadow-md flex items-center justify-between px-6 py-3 z-10 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Syntecxhub Chat</h1>
          <p className="text-xs text-blue-100">Welcome, {user?.username}!</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 transition-colors border border-blue-500 shadow-sm"
        >
          Logout
        </button>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <RoomList 
          rooms={rooms} 
          setRooms={setRooms}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* Content Area */}
        <RoomDetails 
          room={selectedRoom}
          onUpdateRoom={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
        />
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
