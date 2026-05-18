import mongoose from 'mongoose';

const taskMentorTaskSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  day_number: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed', 'skipped'],
    default: 'pending',
  },
  due_date: {
    type: Date,
  },
  estimated_time: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  motivational_message: {
    type: String,
  },
  note_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
  },
  subtasks: [{
    type: String,
  }],
}, {
  timestamps: true,
});

export default mongoose.model('TaskMentorTask', taskMentorTaskSchema);
