const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ticketId: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['Account Issues', 'Transactions', 'Cards', 'Loans', 'Technical', 'General'], required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
