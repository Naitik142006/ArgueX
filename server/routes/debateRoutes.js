import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createDebate, addMessage, getDebates, getDebateById } from '../controllers/debateController.js';

const router = express.Router();

router.route('/').get(protect, getDebates).post(protect, createDebate);
router.route('/:id').get(protect, getDebateById).post(protect, addMessage);

export default router;
