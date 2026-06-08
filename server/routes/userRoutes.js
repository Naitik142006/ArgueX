import express from 'express';
import { getLeaderboard, getUserAnalytics } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for global leaderboard
router.get('/leaderboard', getLeaderboard);

// Protected route for personal analytics
router.get('/me/analytics', protect, getUserAnalytics);

export default router;
