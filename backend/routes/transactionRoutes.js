const express = require('express');
const router = express.Router();
const { getTransactions, getTransactionById, deposit, withdraw } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getTransactions);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.get('/:id', getTransactionById);

module.exports = router;
