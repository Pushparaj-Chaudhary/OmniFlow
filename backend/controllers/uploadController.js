import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Attachments storage
const attachmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const allowedFormats = ['jpg', 'png', 'jpeg', 'pdf'];

    return {
      folder: 'Omniflow/attachments',
      resource_type: 'auto',
      format: allowedFormats.includes(file.mimetype.split('/')[1])
        ? file.mimetype.split('/')[1]
        : undefined,
    };
  },
});

// ✅ Voice storage
const voiceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Omniflow/voice_notes',
    resource_type: 'video', // audio handled as video
  },
});

// ✅ Multer setup
const uploadAttachment = multer({ storage: attachmentStorage });
const uploadVoice = multer({ storage: voiceStorage });

// ✅ Middlewares
export const uploadAttachmentMiddleware = uploadAttachment.single('file');
export const uploadVoiceMiddleware = uploadVoice.single('audio');

// ✅ Upload attachment controller
export const handleAttachmentUpload = (req, res) => {
  try {
    if (req.file) {
      return res.json({ url: req.file.path });
    }
    return res.status(400).json({ message: 'No file uploaded' });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// ✅ Upload voice controller
export const handleVoiceUpload = (req, res) => {
  try {
    if (req.file) {
      return res.json({ url: req.file.path });
    }
    return res.status(400).json({ message: 'No audio uploaded' });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: 'Upload failed' });
  }
};