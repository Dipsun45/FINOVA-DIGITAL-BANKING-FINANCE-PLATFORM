const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  seedUsers,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.route('/users').get(getUsers).post(createUser);
router.route('/users/:id').put(updateUser).delete(deleteUser);
router.post('/seed-users', seedUsers);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
