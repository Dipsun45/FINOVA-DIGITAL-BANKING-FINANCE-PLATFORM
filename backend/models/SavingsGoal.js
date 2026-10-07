const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0.0 },
    deadline: { type: Date, required: true },
    category: { type: String, default: 'General' },
    status: { type: String, enum: ['In Progress', 'Completed', 'Paused'], default: 'In Progress' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
