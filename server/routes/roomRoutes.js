import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomMessages,
  addMessageToRoom,
  leaveRoom,
  endRoom,
  startRoom,
  getUserRooms,
} from '../controllers/roomController.js';

const router = express.Router();

/**
 * Room Routes
 * 
 * All routes require authentication (JWT token)
 * Protected by authMiddleware
 */

// Create a new debate room
router.post('/create', protect, createRoom);

// Join an existing room
router.post('/:roomId/join', protect, joinRoom);

// Get room details
router.get('/:roomId', protect, getRoom);

// Get messages in room (with pagination)
router.get('/:roomId/messages', protect, getRoomMessages);

// Add message to room (called after Socket.IO broadcasts)
router.post('/:roomId/messages', protect, addMessageToRoom);

// Leave room
router.post('/:roomId/leave', protect, leaveRoom);

// Start debate (only creator)
router.post('/:roomId/start', protect, startRoom);

// End debate (only creator)
router.post('/:roomId/end', protect, endRoom);

// Get user's active rooms
router.get('/user/active', protect, getUserRooms);

export default router;
