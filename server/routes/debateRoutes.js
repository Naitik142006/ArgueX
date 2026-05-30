import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createDebate, addMessage, getDebates, getDebateById } from '../controllers/debateController.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.route('/').get(asyncHandler(protect), asyncHandler(getDebates)).post(asyncHandler(protect), asyncHandler(createDebate));
router.route('/:id').get(asyncHandler(protect), asyncHandler(getDebateById)).post(asyncHandler(protect), asyncHandler(addMessage));

export default router;
