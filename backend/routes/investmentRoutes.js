const express = require('express');
const router = express.Router();
const { getInvestments, buyAsset } = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getInvestments);
router.post('/buy', buyAsset);

module.exports = router;
