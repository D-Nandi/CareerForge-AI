const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerforge';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB failed (${err.message}). Attempting local fallback...`);
    try {
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/careerforge', {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ MongoDB Connected (Local Fallback): ${localConn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ MongoDB connection failed completely: ${localErr.message}`);
    }
  }
};

module.exports = connectDB;
