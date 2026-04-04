import express from 'express';
const router = express.Router();
import { uploadAttachmentMiddleware, uploadVoiceMiddleware, handleAttachmentUpload, handleVoiceUpload } from '../controllers/uploadController.js';

router.post('/attachment', uploadAttachmentMiddleware, handleAttachmentUpload);
router.post('/voice', uploadVoiceMiddleware, handleVoiceUpload);

export default router;
