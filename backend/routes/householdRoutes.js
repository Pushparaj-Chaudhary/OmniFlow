import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createHousehold,
  joinHousehold,
  getHouseholdMembers,
  removeMember
} from '../controllers/householdController.js';

const router = express.Router();

router.post('/', protect, createHousehold);
router.post('/join', protect, joinHousehold);
router.get('/members', protect, getHouseholdMembers);
router.post('/remove-member', protect, removeMember);

export default router;
