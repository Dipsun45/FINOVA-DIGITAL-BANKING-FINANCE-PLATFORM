const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Transfer = require('../models/Transfer');
const Card = require('../models/Card');
const Loan = require('../models/Loan');
const Cheque = require('../models/Cheque');
const FixedDeposit = require('../models/FixedDeposit');
const CashDeposit = require('../models/CashDeposit');
const SupportTicket = require('../models/SupportTicket');
const AdminLog = require('../models/AdminLog');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/socketService');
const { runSeeder } = require('../utils/seed');

// @desc    Get Admin Dashboard KPI Statistics & Analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', status: 'Active' });
    const suspendedUsers = await User.countDocuments({ role: 'user', status: 'Suspended' });
    const pendingKYC = await User.countDocuments({ kycStatus: 'Pending' });

    const accounts = await Account.find();
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const deposits = await Transaction.aggregate([
      { $match: { type: 'Deposit', status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDeposits = deposits[0] ? deposits[0].total : 0;

    const withdrawals = await Transaction.aggregate([
      { $match: { type: 'Withdrawal', status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = withdrawals[0] ? withdrawals[0].total : 0;

    const totalCheques = await Cheque.countDocuments();
    const pendingCheques = await Cheque.countDocuments({ status: 'Pending' });
    const totalFixedDeposits = await FixedDeposit.countDocuments({ status: 'Active' });
    const totalCashDeposits = await CashDeposit.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        pendingKYC,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        totalCheques,
        pendingCheques,
        totalFixedDeposits,
        totalCashDeposits
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, pagination, status filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, status, role, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') query.status = status;
    if (role && role !== 'All') query.role = role;

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user from Admin Panel with Fixed User ID & Password
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const {
      userId, fullName, email, password, phone, role = 'user',
      accountType = 'Checking Account', initialBalance = 5000,
      nationalId, address, city, state, country, gender, occupation, dateOfBirth
    } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Please enter Full Name, Email, and Password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Auto generate userId if not supplied
    const fixedUserId = userId ? userId.trim() : ('USR' + Math.floor(1000 + Math.random() * 9000));

    const existingUserId = await User.findOne({ userId: fixedUserId });
    if (existingUserId) {
      return res.status(400).json({ success: false, message: `User ID '${fixedUserId}' is already assigned` });
    }

    const user = await User.create({
      userId: fixedUserId,
      fullName,
      email,
      password,
      phone: phone || '+1 (555) 019-2834',
      dateOfBirth: dateOfBirth || '1995-05-15',
      gender: gender || 'Unspecified',
      occupation: occupation || 'Professional',
      nationalId: nationalId || '',
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || 'United States',
      role,
      status: 'Active',
      kycStatus: 'Verified'
    });

    // Create Checking & Savings accounts for new user
    const checkingAccNum = 'FN-CHK-' + Math.floor(100000000 + Math.random() * 900000000);
    const balance = parseFloat(initialBalance) || 5000;

    const account = await Account.create({
      user: user._id,
      accountNumber: checkingAccNum,
      accountType,
      balance,
      availableBalance: balance
    });

    // Issue initial ATM Card for user
    await Card.create({
      user: user._id,
      account: account._id,
      cardNumber: '4821 9302 8410 ' + Math.floor(1000 + Math.random() * 9000),
      cardHolderName: user.fullName.toUpperCase(),
      validThru: '12/29',
      cvv: '849',
      pin: '1234',
      cardType: 'Debit',
      brand: 'Visa'
    });

    // Audit Log
    await AdminLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Create User',
      target: user.email,
      ip: req.ip || '127.0.0.1',
      description: `Admin created user ${user.fullName} with User ID '${fixedUserId}' and email ${user.email}`
    });

    res.status(201).json({
      success: true,
      message: `User created successfully with User ID: ${fixedUserId}`,
      user,
      account
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details, fixed password, User ID, status, or role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { userId, fullName, email, phone, role, status, kycStatus, password, nationalId, address, city, state, country, gender, occupation } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (userId) user.userId = userId;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;
    if (kycStatus) user.kycStatus = kycStatus;
    if (nationalId !== undefined) user.nationalId = nationalId;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (gender !== undefined) user.gender = gender;
    if (occupation !== undefined) user.occupation = occupation;
    if (password) user.password = password; // Pre-save hook will hash

    await user.save();

    await AdminLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Update User',
      target: user.email,
      ip: req.ip || '127.0.0.1',
      description: `Updated profile/credentials of user ${user.email}`
    });

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = 'Suspended';
    await user.save();

    await AdminLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Suspend User',
      target: user.email,
      ip: req.ip || '127.0.0.1',
      description: `Suspended user account ${user.email}`
    });

    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed 20 complete mock users (Admin action)
// @route   POST /api/admin/seed-users
// @access  Private/Admin
const seedUsers = async (req, res, next) => {
  try {
    await runSeeder();
    res.json({ success: true, message: '20 User Accounts with complete banking details successfully seeded into system!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  seedUsers,
  getAuditLogs
};
