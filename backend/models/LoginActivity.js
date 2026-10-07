const mongoose = require('mongoose');

const loginActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ip: { type: String, default: '127.0.0.1' },
    device: { type: String, default: 'Chrome on Windows 11' },
    browser: { type: String, default: 'Chrome 124.0' },
    location: { type: String, default: 'New York, US' },
    status: { type: String, enum: ['Success', 'Failed'], default: 'Success' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginActivity', loginActivitySchema);
