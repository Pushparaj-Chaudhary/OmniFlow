import express from 'express';
const router = express.Router();
import { summarizeText, generateTitle, extractTasks, enhanceNote, optimizeRoutine, generateRoadmap, generateTask } from '../controllers/aiController.js';

router.post('/summarize', summarizeText);
router.post('/generate-title', generateTitle);
router.post('/extract-tasks', extractTasks);
router.post('/enhance', enhanceNote);
router.post('/optimize-routine', optimizeRoutine);
router.post('/generate-roadmap', generateRoadmap);
router.post('/generate-task', generateTask);

export default router;
