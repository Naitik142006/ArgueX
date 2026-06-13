import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createRoom, joinRoom, leaveRoom } from '../controllers/pvpController.js';

const router = express.Router();

router.post('/create', protect, createRoom);
router.post('/join', protect, joinRoom);
router.post('/leave', protect, leaveRoom);

export default router;
