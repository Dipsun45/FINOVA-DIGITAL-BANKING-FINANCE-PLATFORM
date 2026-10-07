const express = require('express');
const router = express.Router();
const {
  getCards,
  createCard,
  updateCardStatus,
  changePin,
  updateCardSettings,
  atmWithdraw
} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCards)
  .post(createCard);

router.put('/:id/status', updateCardStatus);
router.put('/:id/pin', changePin);
router.put('/:id/settings', updateCardSettings);
router.post('/atm-withdraw', atmWithdraw);

module.exports = router;
