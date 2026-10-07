const SupportTicket = require('../models/SupportTicket');
const Message = require('../models/Message');
const { sendTicketMessage } = require('../services/socketService');

// @desc    Get user support tickets
// @route   GET /api/support
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    const tickets = await SupportTicket.find(query)
      .populate('user', 'fullName email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create support ticket
// @route   POST /api/support
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { subject, category, priority, description } = req.body;

    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

    const ticket = await SupportTicket.create({
      user: req.user._id,
      ticketId,
      subject,
      category,
      priority: priority || 'Medium',
      description,
      status: 'Open'
    });

    // Create initial message
    const firstMsg = await Message.create({
      ticket: ticket._id,
      sender: req.user._id,
      senderName: req.user.fullName,
      senderRole: req.user.role,
      message: description
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created',
      ticket,
      firstMessage: firstMsg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a ticket
// @route   GET /api/support/:id/messages
// @access  Private
const getTicketMessages = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    const messages = await Message.find({ ticket: ticket._id }).sort({ createdAt: 1 });
    res.json({ success: true, ticket, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Add message to ticket (Support Chat)
// @route   POST /api/support/:id/messages
// @access  Private
const addTicketMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const newMsg = await Message.create({
      ticket: ticket._id,
      sender: req.user._id,
      senderName: req.user.fullName,
      senderRole: req.user.role,
      message: message.trim()
    });

    ticket.updatedAt = new Date();
    if (req.user.role === 'admin' && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    await ticket.save();

    // Broadcast via Socket.IO to subscribers of this ticket
    sendTicketMessage(ticket._id.toString(), newMsg);

    res.status(201).json({ success: true, message: newMsg });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  createTicket,
  getTicketMessages,
  addTicketMessage
};
