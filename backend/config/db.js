const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finova', {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`Local MongoDB connection notice (${error.message}). Initializing In-Memory Mongo Database...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (memError) {
      console.error(`In-Memory MongoDB Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
