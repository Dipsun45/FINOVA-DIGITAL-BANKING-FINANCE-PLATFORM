const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, default: '' },
    ip: { type: String, default: '127.0.0.1' },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminLog', adminLogSchema);
