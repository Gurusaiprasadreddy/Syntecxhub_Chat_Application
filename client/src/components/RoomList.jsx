import React, { useState, useEffect } from 'react';
import { getRooms } from '../services/api';

const RoomList = ({ rooms, setRooms, selectedRoom, setSelectedRoom, onOpenCreateModal }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getRooms();
        setRooms(res.data.rooms);
      } catch (err) {
        setError('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [setRooms]);

  if (loading) return <div className="p-4 text-gray-500">Loading rooms...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-bold text-gray-700">Rooms</h2>
        <button 
          onClick={onOpenCreateModal}
          className="bg-blue-500 text-white p-1 px-2 rounded text-sm hover:bg-blue-600 transition"
        >
          + New
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {rooms.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">No rooms available.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rooms.map(room => (
              <li key={room._id}>
                <button
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    selectedRoom?._id === room._id ? 'bg-blue-100 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="font-semibold text-gray-800"># {room.name}</div>
                  <div className="text-xs text-gray-500 truncate">{room.description || 'No description'}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoomList;
