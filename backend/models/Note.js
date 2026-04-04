import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Note', 'Task', 'Routine'],
    default: 'Task',
  },
  description: {
    type: String,
    default: "",
  },
  checklist: [{
    text: String,
    isCompleted: { type: Boolean, default: false }
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  datewiseProgress: [{
    date: { type: String },
    progress: { type: Number, default: 0 }
  }],
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  assignedPerson: {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  attachments: [{
    type: String,
  }],
  voiceNotes: [{
    type: String,
  }],
  reminderDate: {
    type: Date,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for search queries
noteSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Note', noteSchema);
