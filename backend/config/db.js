const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`MongoDB Warning: ${err.message}. Running in standalone mode.`);
  }
};

module.exports = connectDB;
