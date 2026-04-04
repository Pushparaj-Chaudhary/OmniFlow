import express from 'express';
const router = express.Router();
import { summarizeText, generateTitle, extractTasks, enhanceNote } from '../controllers/aiController.js';

router.post('/summarize', summarizeText);
router.post('/generate-title', generateTitle);
router.post('/extract-tasks', extractTasks);
router.post('/enhance', enhanceNote);

export default router;
