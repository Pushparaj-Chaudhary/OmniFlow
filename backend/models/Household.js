import mongoose from 'mongoose';

const householdSchema = new mongoose.Schema({
  name: { type: String, required: true },
  secretCode: { type: String, unique: true, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  virtualMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
}, { timestamps: true });

export default mongoose.model('Household', householdSchema);
