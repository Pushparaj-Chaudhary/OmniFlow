import express from 'express';
import {
  getSummary,
  getPerformance,
  getUserProductivity,
  getPriorityData,
  getActivity,
  getAIInsights
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/performance', getPerformance);
router.get('/productivity', getUserProductivity);
router.get('/priorities', getPriorityData);
router.get('/activity', getActivity);
router.get('/insights', getAIInsights);

export default router;
