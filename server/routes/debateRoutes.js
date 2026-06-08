import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createDebate, addMessage, getDebates, getDebateById, getDebateStatistics, evaluateGroup } from '../controllers/debateController.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.route('/').get(asyncHandler(protect), asyncHandler(getDebates)).post(asyncHandler(protect), asyncHandler(createDebate));
router.route('/group/evaluate').post(asyncHandler(protect), asyncHandler(evaluateGroup));
router.route('/:id').get(asyncHandler(protect), asyncHandler(getDebateById)).post(asyncHandler(protect), asyncHandler(addMessage));
router.route('/:id/statistics').get(asyncHandler(protect), asyncHandler(getDebateStatistics));

export default router;
