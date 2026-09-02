const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar isOnline');
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('getRooms Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching rooms' });
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    const trimmedName = name.trim();
    const existingRoom = await Room.findOne({ name: trimmedName });

    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Room already exists' });
    }

    const room = await Room.create({
      name: trimmedName,
      description: description ? description.trim() : '',
      createdBy: req.user._id,
      members: [req.user._id]
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar isOnline');

    res.status(201).json({ success: true, room: populatedRoom });
  } catch (error) {
    console.error('createRoom Error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating room' });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:roomId
// @access  Private
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar isOnline');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    console.error('getRoom Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching room' });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/:roomId/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'User already in room' });
    }

    room.members.push(req.user._id);
    await room.save();

    const updatedRoom = await Room.findById(req.params.roomId)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar isOnline');

    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('joinRoom Error:', error);
    res.status(500).json({ success: false, message: 'Server error while joining room' });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/:roomId/leave
// @access  Private
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!room.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'User not in room' });
    }

    // Optional: prevent the creator from leaving
    if (room.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Room creator cannot leave the room' });
    }

    room.members = room.members.filter(memberId => memberId.toString() !== req.user._id.toString());
    await room.save();

    const updatedRoom = await Room.findById(req.params.roomId)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar isOnline');

    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('leaveRoom Error:', error);
    res.status(500).json({ success: false, message: 'Server error while leaving room' });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:roomId
// @access  Private
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check authorization
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: only room creator can delete' });
    }

    await Room.deleteOne({ _id: req.params.roomId });

    res.json({ success: true, message: 'Room removed' });
  } catch (error) {
    console.error('deleteRoom Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting room' });
  }
};

module.exports = {
  getRooms,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  deleteRoom
};
