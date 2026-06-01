import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addReaction,
  removeReaction,
  editMessage,
  deleteMessage,
  pinMessage,
  unpinMessage,
  getDebateStatistics,
  getPinnedMessages,
  getThread,
  replyToMessage,
} from '../controllers/chatController.js';

const router = express.Router();

/**
 * Enhanced Chat Routes
 * 
 * All routes require authentication (JWT token)
 * Protected by authMiddleware
 */

// Reactions
router.post('/rooms/:roomId/reactions/add', protect, addReaction);
router.post('/rooms/:roomId/reactions/remove', protect, removeReaction);

// Message editing
router.put('/rooms/:roomId/messages/:messageId', protect, editMessage);

// Message deletion
router.delete('/rooms/:roomId/messages/:messageId', protect, deleteMessage);

// Message pinning
router.post('/rooms/:roomId/messages/:messageId/pin', protect, pinMessage);
router.post('/rooms/:roomId/messages/:messageId/unpin', protect, unpinMessage);

// Pinned messages
router.get('/rooms/:roomId/pinned', protect, getPinnedMessages);

// Threaded replies
router.post('/rooms/:roomId/threads/:parentId/reply', protect, replyToMessage);
router.get('/rooms/:roomId/threads/:messageId', protect, getThread);

// Statistics
router.get('/rooms/:roomId/statistics', protect, getDebateStatistics);

export default router;
