const express = require('express');
const router = express.Router();
const { getBills, createBill, payBill, deleteBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getBills).post(createBill);
router.post('/:id/pay', payBill);
router.delete('/:id', deleteBill);

module.exports = router;
