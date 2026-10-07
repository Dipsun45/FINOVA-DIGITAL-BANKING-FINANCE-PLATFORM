const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { initSocket } = require('./services/socketService');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const { runSeeder } = require('./utils/seed');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount < 5) {
      logger.info('Initializing 20-User Banking Database Seed...');
      await runSeeder();
    }
  } catch (err) {
    logger.error(`Auto-seed check error: ${err.message}`);
  }
});

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
initSocket(io);

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Request Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'FINOVA Banking API Server Operational', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/cheques', require('./routes/chequeRoutes'));
app.use('/api/fixed-deposits', require('./routes/fixedDepositRoutes'));
app.use('/api/cash-deposits', require('./routes/cashDepositRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`FINOVA Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
