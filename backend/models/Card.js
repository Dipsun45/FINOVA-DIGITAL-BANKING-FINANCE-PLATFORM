const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    cardNumber: { type: String, required: true }, // Masked / demo card number e.g. "4821 9302 8410 4821"
    cardHolderName: { type: String, required: true },
    validThru: { type: String, default: '12/29' },
    cvv: { type: String, default: '***' },
    cardType: { type: String, enum: ['Debit', 'Credit'], default: 'Debit' },
    brand: { type: String, enum: ['Visa', 'Mastercard'], default: 'Visa' },
    isFrozen: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    pin: { type: String, default: '1234' },
    spendingLimit: { type: Number, default: 5000 },
    onlinePaymentsEnabled: { type: Boolean, default: true },
    internationalPaymentsEnabled: { type: Boolean, default: true },
    cardColor: { type: String, default: 'from-blue-600 via-indigo-600 to-purple-800' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);
