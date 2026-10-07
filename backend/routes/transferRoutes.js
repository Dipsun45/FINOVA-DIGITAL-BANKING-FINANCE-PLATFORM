const express = require('express');
const router = express.Router();
const { createTransfer, getTransfers } = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getTransfers).post(createTransfer);

module.exports = router;
