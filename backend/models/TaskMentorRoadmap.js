import mongoose from 'mongoose';

const taskMentorRoadmapSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weeks: [
    {
      week_number: Number,
      title: String,
      topics: [
        {
          title: String,
          description: String,
          subtasks: [String],
          difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium'
          },
          estimated_time: String
        }
      ],
    }
  ],
}, {
  timestamps: true,
});

export default mongoose.model('TaskMentorRoadmap', taskMentorRoadmapSchema);
