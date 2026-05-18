import mongoose from 'mongoose';

const taskMentorProgressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  current_day: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  last_active: {
    type: Date,
  },
  tasks_completed_today: {
    type: Number,
    default: 0,
  },
  last_task_completion_date: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model('TaskMentorProgress', taskMentorProgressSchema);
