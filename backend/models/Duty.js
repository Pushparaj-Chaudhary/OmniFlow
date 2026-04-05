import mongoose from 'mongoose';

const Dutieschema = new mongoose.Schema({
  name: { type: String, required: true },
  currentAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  nextAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  date: { type: Date },
  timeOfDay: { type: String, enum: ['Morning', 'Night', 'Full Day'], default: 'Full Day' },
  rotationDays: { type: Number, default: 1, min: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Duty', Dutieschema);
