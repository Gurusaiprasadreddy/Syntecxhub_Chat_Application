const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRooms)
  .post(protect, createRoom);

router.route('/:roomId')
  .get(protect, getRoom)
  .delete(protect, deleteRoom);

router.post('/:roomId/join', protect, joinRoom);
router.post('/:roomId/leave', protect, leaveRoom);

module.exports = router;
