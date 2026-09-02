const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

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

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.username})`);

    // Handle joining a room
    socket.on('join_room', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;
        
        // Leave previous rooms (except their own socket id room)
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
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

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initializeSocket;
