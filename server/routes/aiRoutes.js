import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { generateReply, analyzeDebate, getTopics } from '../controllers/aiController.js';

const router = express.Router();

// All AI routes should be protected
router.post('/topics', asyncHandler(protect), asyncHandler(getTopics));
router.post('/:id/reply', asyncHandler(protect), asyncHandler(generateReply));
router.post('/:id/analyze', asyncHandler(protect), asyncHandler(analyzeDebate));

export default router;
