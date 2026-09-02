import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { joinRoom, leaveRoom, deleteRoom, getMessages } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const RoomDetails = ({ room, onUpdateRoom, onDeleteRoom }) => {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [roomData, setRoomData] = useState(room); // Local state to update presence in real-time
  
  const getSocket = useSocket(token);

  // Sync prop to local state
  useEffect(() => {
    setRoomData(room);
  }, [room]);

  useEffect(() => {
    let active = true;
    setTypingUsers([]); // Reset typing users when room changes

    const loadRoomData = async () => {
      if (!room) return;
      
      const isMember = room.members.some(member => member._id === user._id);
      if (!isMember) {
        setMessages([]);
        return;
      }

      try {
        const res = await getMessages(room._id);
        if (active) {
          setMessages(res.data.messages);
          
          // Connect to socket room
          const socket = getSocket();
          if (socket) {
            socket.emit('join_room', { roomId: room._id });
            setIsConnected(socket.connected);
          }
        }
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    loadRoomData();

    return () => {
      active = false;
      const socket = getSocket();
      if (socket && room) {
        socket.emit('leave_room', { roomId: room._id });
      }
    };
  }, [room, user._id, getSocket]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !room) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleReceiveMessage = (newMessage) => {
      if (newMessage.room === room._id) {
        setMessages(prev => [...prev, newMessage]);
      }
    };

    const handleUserTyping = ({ username, roomId }) => {
      if (roomId === room._id) {
        setTypingUsers(prev => {
          if (!prev.includes(username)) {
            return [...prev, username];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = ({ username, roomId }) => {
      if (roomId === room._id) {
        setTypingUsers(prev => prev.filter(u => u !== username));
      }
    };

    const handleUserOnline = ({ userId }) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map(m => m._id === userId ? { ...m, isOnline: true } : m)
        };
      });
    };

    const handleUserOffline = ({ userId }) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map(m => m._id === userId ? { ...m, isOnline: false } : m)
        };
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    // Initial check
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [room, getSocket]);

  if (!roomData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        <p className="text-lg">Select a room from the sidebar to view details</p>
      </div>
    );
  }

  const isMember = roomData.members.some(member => member._id === user._id);
  const isCreator = roomData.createdBy._id === user._id;

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await joinRoom(roomData._id);
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
      const res = await leaveRoom(roomData._id);
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
      await deleteRoom(roomData._id);
      onDeleteRoom(roomData._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
      setLoading(false);
    }
  };

  const handleSendMessage = (messageText) => {
    const socket = getSocket();
    if (socket && isMember) {
      socket.emit('send_message', { roomId: roomData._id, message: messageText });
    }
  };

  const handleTypingStart = () => {
    const socket = getSocket();
    if (socket && isMember) {
      socket.emit('typing_start', { roomId: roomData._id });
    }
  };

  const handleTypingStop = () => {
    const socket = getSocket();
    if (socket && isMember) {
      socket.emit('typing_stop', { roomId: roomData._id });
    }
  };

  const onlineMembersCount = roomData.members.filter(m => m.isOnline).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shrink-0 shadow-sm z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mb-3 sm:mb-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-gray-400 mr-2">#</span>
              {roomData.name}
            </h2>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          {roomData.description && <p className="text-sm text-gray-500 mt-1">{roomData.description}</p>}
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span>{roomData.members.length} member{roomData.members.length !== 1 && 's'}</span>
            <span>•</span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {onlineMembersCount} online
            </span>
          </div>
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
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-sm transition"
            >
              Leave
            </button>
          )}
          {isCreator && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm transition"
              title="Only the creator can delete the room"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-600 px-4 py-2 text-sm text-center shrink-0">
          {error}
        </div>
      )}

      {/* Messages area */}
      {!isMember ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 p-4">
          <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-sm w-full">
            <p className="text-lg font-medium text-gray-700 mb-2">You are not a member</p>
            <p className="mb-4 text-sm">You must join this room to see messages and participate.</p>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition w-full"
            >
              Join {roomData.name}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList messages={messages} currentUserId={user._id} />
          <TypingIndicator typingUsers={typingUsers} />
          <MessageInput 
            onSendMessage={handleSendMessage} 
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            disabled={!isMember || !isConnected} 
          />
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
