import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
    },
    appearance: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      themeColor: { type: String, default: 'purple' },
      cardSize: { type: String, enum: ['compact', 'comfortable'], default: 'comfortable' },
    },
  },
  activeHousehold: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
  // Task Mentor Fields
  mentor_onboarded: { type: Boolean, default: false },
  level: { type: String },
  goal: { type: String },
  daily_time: { type: Number },
  mentor_reminder_time: { type: String, default: '20:00' }
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
