import express from 'express';
const router = express.Router();
import { requestOtp, verifyOtp, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.put('/profile', protect, updateProfile);

export default router;
