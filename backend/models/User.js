const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, sparse: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Unspecified'], default: 'Unspecified' },
    occupation: { type: String, default: '' },
    nationalId: { type: String, default: '' }, // Aadhar / PAN / SSN / National ID
    password: { type: String, required: true, select: false },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'United States' },
    zipCode: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    nomineeName: { type: String, default: '' },
    nomineeRelation: { type: String, default: '' },
    nomineeAge: { type: Number },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Unspecified'], default: 'Unspecified' },
    profileImage: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    kycStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Verified' },
    isTwoFactorEnabled: { type: Boolean, default: false },
    currency: { type: String, default: 'USD' },
    themePreference: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    creditScore: { type: Number, default: 785 }
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
