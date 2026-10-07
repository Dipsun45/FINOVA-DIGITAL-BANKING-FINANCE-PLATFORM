const express = require('express');
const router = express.Router();
const {
  submitCheque,
  getUserCheques,
  getAllCheques,
  processCheque
} = require('../controllers/chequeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(submitCheque)
  .get(getUserCheques);

router.get('/admin/all', admin, getAllCheques);
router.put('/admin/:id', admin, processCheque);

module.exports = router;
