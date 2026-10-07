const express = require('express');
const router = express.Router();
const {
  createFixedDeposit,
  getUserFixedDeposits,
  withdrawFixedDeposit,
  getAllFixedDeposits
} = require('../controllers/fixedDepositController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createFixedDeposit)
  .get(getUserFixedDeposits);

router.put('/:id/withdraw', withdrawFixedDeposit);
router.get('/admin/all', admin, getAllFixedDeposits);

module.exports = router;
