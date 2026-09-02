const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 1, // prevent empty messages
    maxlength: 2000
  }
}, {
  timestamps: true // automatically generates createdAt and updatedAt
});

// Index to quickly fetch messages for a room sorted by time
messageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
