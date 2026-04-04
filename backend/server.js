import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import startCron from './cron/reminderCron.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import flatManagerRoutes from './routes/flatManagerRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

// Connect Database
connectDB();

const app = express();
app.get('/api/health', (req, res) => {
  res.send('Server is alive');
});

app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : '*'
}));
app.use(express.json());

// Basic health check for Render
app.get('/', (req, res) => {
  res.send('Omniflow API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/flatmanager', flatManagerRoutes);
app.use('/api/reports', reportRoutes);

// Initialize Reminder Cron Job
startCron();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
