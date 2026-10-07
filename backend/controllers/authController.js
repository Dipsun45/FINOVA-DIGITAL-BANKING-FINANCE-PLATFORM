const User = require('../models/User');
const Account = require('../models/Account');
const Card = require('../models/Card');
const Notification = require('../models/Notification');
const LoginActivity = require('../models/LoginActivity');
const generateToken = require('../utils/generateToken');
const { notifyUser } = require('../services/socketService');

// @desc    Register a new user (Note: Self-registration disabled by system policy, admin creates users)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    return res.status(403).json({
      success: false,
      message: 'Self-service registration is disabled. Account creation is managed by Bank Administrator.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token (Login using fixed User ID or Email)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, userId, password } = req.body;
    const loginIdentifier = (email || userId || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide User ID/Email and Password' });
    }

    // Match by email OR userId
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { userId: loginIdentifier }
      ]
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'Suspended') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact bank support.' });
      }

      // Record Login Activity
      await LoginActivity.create({
        user: user._id,
        ip: req.ip || '127.0.0.1',
        device: req.headers['user-agent'] || 'Web Browser',
        status: 'Success'
      });

      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          kycStatus: user.kycStatus,
          profileImage: user.profileImage,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          occupation: user.occupation,
          nationalId: user.nationalId,
          address: user.address,
          city: user.city,
          state: user.state,
          country: user.country,
          zipCode: user.zipCode,
          emergencyContact: user.emergencyContact,
          nomineeName: user.nomineeName,
          nomineeRelation: user.nomineeRelation,
          nomineeAge: user.nomineeAge,
          maritalStatus: user.maritalStatus,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          currency: user.currency,
          themePreference: user.themePreference
        }
      });
    } else {
      if (user) {
        await LoginActivity.create({
          user: user._id,
          ip: req.ip || '127.0.0.1',
          device: req.headers['user-agent'] || 'Web Browser',
          status: 'Failed'
        });
      }
      res.status(401).json({ success: false, message: 'Invalid User ID/Email or Password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile with full details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const fields = [
      'fullName', 'phone', 'dateOfBirth', 'gender', 'occupation', 'nationalId',
      'address', 'city', 'state', 'country', 'zipCode', 'emergencyContact',
      'nomineeName', 'nomineeRelation', 'nomineeAge', 'maritalStatus',
      'profileImage', 'currency', 'themePreference'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Full profile details updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    const notif = await Notification.create({
      user: user._id,
      title: 'Security Alert: Password Changed',
      message: 'Your account password was updated successfully.',
      type: 'security'
    });
    notifyUser(user._id.toString(), notif);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle 2FA
// @route   PUT /api/auth/toggle-2fa
// @access  Private
const toggle2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();

    res.json({
      success: true,
      message: `2FA ${user.isTwoFactorEnabled ? 'enabled' : 'disabled'} successfully`,
      isTwoFactorEnabled: user.isTwoFactorEnabled
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  toggle2FA
};
