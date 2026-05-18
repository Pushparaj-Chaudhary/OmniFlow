import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'paidByType', required: true },
  paidByType: { type: String, required: true, enum: ['User', 'Group'], default: 'Group' },
  date: { type: Date },
  photoUrl: { type: String },
  household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
