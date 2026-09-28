const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillnexus_week3_todo', {
      serverSelectionTimeoutMS: 2500
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Notice: ${error.message}`);
    console.warn('⚠️ Operating with dynamic resilient storage store.');
  }
};

module.exports = { connectDB, getIsConnected: () => isConnected };
