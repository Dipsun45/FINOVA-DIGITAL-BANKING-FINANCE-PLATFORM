const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, changePassword, toggle2FA } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidator');

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/toggle-2fa', protect, toggle2FA);

module.exports = router;
