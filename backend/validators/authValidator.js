const { check } = require('express-validator');

const registerValidator = [
  check('fullName', 'Full Name is required').notEmpty().trim(),
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 4 characters long').isLength({ min: 4 }),
  check('phone', 'Phone number is required').notEmpty()
];

const loginValidator = [
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
];

module.exports = { registerValidator, loginValidator };
