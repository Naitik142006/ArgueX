import express from 'express';
import { signup, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/me', asyncHandler(protect), asyncHandler(getProfile));
router.get('/profile', asyncHandler(protect), asyncHandler(getProfile));

export default router;
