const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const userConnections = new Map(); // userId -> connection count

const initializeSocket = (io) => {
  // Middleware for Socket Authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.username})`);
    
    const userIdStr = socket.user._id.toString();
    const currentCount = userConnections.get(userIdStr) || 0;
    userConnections.set(userIdStr, currentCount + 1);

    // If first connection, mark online
    if (currentCount === 0) {
      await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
      io.emit('user_online', { userId: userIdStr, username: socket.user.username });
    }

    // Handle joining a room
    socket.on('join_room', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;
        
        // Leave previous rooms (except their own socket id room)
        socket.rooms.forEach(r => {
          if (r !== socket.id) {
            socket.leave(r);
          }
        });

        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      } catch (err) {
        console.error('Socket join_room error:', err);
      }
    });

    // Handle leaving a room
    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle typing events
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.user._id.toString(),
        username: socket.user.username,
        roomId
      });
    });

    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('user_stopped_typing', {
        userId: socket.user._id.toString(),
        roomId
      });
    });

    // Handle sending a message
    socket.on('send_message', async ({ roomId, message }) => {
      try {
        if (!message || message.trim().length === 0) return;
        
        const room = await Room.findById(roomId);
        if (!room) return;

        // Verify user is member of the room (MongoDB validation)
        if (!room.members.includes(socket.user._id)) return;

        // Create and save the message to MongoDB
        const newMessage = await Message.create({
          sender: socket.user._id,
          room: roomId,
          message: message.trim()
        });

        // Populate sender details safely for broadcast
        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username avatar');

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('receive_message', populatedMessage);
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      const userIdStr = socket.user._id.toString();
      const currentCount = userConnections.get(userIdStr) || 1;
      
      if (currentCount <= 1) {
        userConnections.delete(userIdStr);
        await User.findByIdAndUpdate(socket.user._id, { 
          isOnline: false, 
          lastSeen: Date.now() 
        });
        io.emit('user_offline', { userId: userIdStr, username: socket.user.username });
      } else {
        userConnections.set(userIdStr, currentCount - 1);
      }
    });
  });
};

module.exports = initializeSocket;
