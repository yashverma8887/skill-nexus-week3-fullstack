const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillnexus_week3_taskmanager', {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`✅ Task Manager MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Task Manager Database Note: ${error.message}`);
    console.warn('⚠️ Operating with dynamic high-performance in-memory store.');
  }
};

module.exports = { connectDB };
