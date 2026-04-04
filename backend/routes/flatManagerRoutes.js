import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getGroups, createGroup, updateGroup, deleteGroup,
  getDuties, createDuty, updateDuty, deleteDuty,
  getExpenses, createExpense, deleteExpense
} from '../controllers/flatManagerController.js';

const router = express.Router();

router.route('/groups').get(protect, getGroups).post(protect, createGroup);
router.route('/groups/:id').put(protect, updateGroup).delete(protect, deleteGroup);

router.route('/Duties').get(protect, getDuties).post(protect, createDuty);
router.route('/Duties/:id').put(protect, updateDuty).delete(protect, deleteDuty);

router.route('/expenses').get(protect, getExpenses).post(protect, createExpense);
router.route('/expenses/:id').delete(protect, deleteExpense);

export default router;
