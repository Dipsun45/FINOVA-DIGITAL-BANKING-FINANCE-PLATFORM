const express = require('express');
const router = express.Router();
const { calculateEMI, getLoans, applyLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.post('/calculate', calculateEMI);
router.get('/', protect, getLoans);
router.post('/apply', protect, applyLoan);

module.exports = router;
