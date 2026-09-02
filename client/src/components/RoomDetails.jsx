import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { joinRoom, leaveRoom, deleteRoom } from '../services/api';

const RoomDetails = ({ room, onUpdateRoom, onDeleteRoom }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        <p className="text-lg">Select a room from the sidebar to view details</p>
      </div>
    );
  }

  const isMember = room.members.some(member => member._id === user._id);
  const isCreator = room.createdBy._id === user._id;

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await joinRoom(room._id);
      onUpdateRoom(res.data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await leaveRoom(room._id);
      onUpdateRoom(res.data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave room');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await deleteRoom(room._id);
      onDeleteRoom(room._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800"># {room.name}</h2>
            <p className="text-gray-600 mt-1">{room.description || 'No description provided.'}</p>
            <p className="text-xs text-gray-400 mt-2">
              Created by {room.createdBy.username} on {new Date(room.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex space-x-2">
            {!isMember && (
              <button
                onClick={handleJoin}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition"
              >
                Join Room
              </button>
            )}

            {isMember && !isCreator && (
              <button
                onClick={handleLeave}
                disabled={loading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium text-sm transition"
              >
                Leave Room
              </button>
            )}

            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md font-medium text-sm transition"
                title="Only the creator can delete the room"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {!isMember ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>You must join this room to participate.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Members ({room.members.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.members.map(member => (
                  <div key={member._id} className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center text-sm shadow-sm">
                    <span className={`w-2 h-2 rounded-full mr-2 ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="font-medium text-gray-700">{member.username}</span>
                    {member._id === room.createdBy._id && <span className="ml-1 text-xs text-blue-500">(Admin)</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-gray-200 pt-6">
              <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-gray-500 mb-2">No messages yet</p>
                <p className="text-sm text-blue-600">Real-time messaging will be implemented in Phase 6.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;
