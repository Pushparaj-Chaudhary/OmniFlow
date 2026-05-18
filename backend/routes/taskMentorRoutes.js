import express from 'express';
const router = express.Router();
import { 
  onboardUser, 
  getRoadmap, 
  saveRoadmap, 
  getTodayTask, 
  saveTask, 
  updateTaskStatus, 
  getTaskHistory, 
  getNotifications,
  deleteTask,
  resetRoadmap
} from '../controllers/taskMentorController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/onboard', protect, onboardUser);
router.get('/roadmap', protect, getRoadmap);
router.post('/roadmap', protect, saveRoadmap);
router.delete('/roadmap', protect, resetRoadmap);
router.get('/tasks/today', protect, getTodayTask);
router.post('/tasks', protect, saveTask);
router.post('/tasks/:id/status', protect, updateTaskStatus);
router.get('/tasks/history', protect, getTaskHistory);
router.get('/notifications', protect, getNotifications);
router.delete('/tasks/:id', protect, deleteTask);

export default router;
