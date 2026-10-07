const express = require('express');
const router = express.Router();
const { getGoals, createGoal, addMoneyToGoal, deleteGoal } = require('../controllers/savingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getGoals).post(createGoal);
router.post('/:id/add-money', addMoneyToGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
