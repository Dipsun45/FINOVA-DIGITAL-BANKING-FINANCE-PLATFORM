const express = require('express');
const router = express.Router();
const { getTickets, createTicket, getTicketMessages, addTicketMessage } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getTickets).post(createTicket);
router.route('/:id/messages').get(getTicketMessages).post(addTicketMessage);

module.exports = router;
