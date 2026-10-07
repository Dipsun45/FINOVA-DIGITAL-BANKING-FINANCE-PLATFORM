const express = require('express');
const router = express.Router();
const {
  submitCashDepositSlip,
  getUserCashDeposits,
  getAllCashDeposits
} = require('../controllers/cashDepositController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(submitCashDepositSlip)
  .get(getUserCashDeposits);

router.get('/admin/all', admin, getAllCashDeposits);

module.exports = router;
