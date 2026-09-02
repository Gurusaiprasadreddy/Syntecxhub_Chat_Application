const Message = require('../models/Message');
const Room = require('../models/Room');

// @desc    Get messages by room ID
// @route   GET /api/messages/:roomId
// @access  Private
const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Verify user is in room
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a member of this room' });
    }

    // Retrieve messages sorted by creation time
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 }); // Oldest to newest

    res.json({ success: true, messages });
  } catch (error) {
    console.error('getMessagesByRoom error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching messages' });
  }
};

module.exports = {
  getMessagesByRoom
};
