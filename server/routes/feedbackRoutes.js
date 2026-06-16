import express from 'express';
import {
  submitFeedback,
  getAllFeedback,
  updateFeedback,
  upvoteFeedback,
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, submitFeedback)
  .get(protect, admin, getAllFeedback);

router.route('/:id')
  .patch(protect, admin, updateFeedback);

router.route('/:id/upvote')
  .put(protect, upvoteFeedback);

export default router;
