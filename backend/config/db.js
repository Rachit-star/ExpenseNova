const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    
    if (conn.connection.host.includes('127.0.0.1') || conn.connection.host.includes('localhost')) {
      console.log("  WARNING: You are connected to LOCALHOST");
    } else {
      console.log(" SUCCESS: Connected to MongoDB .");
    }

  } catch (error) {
    console.error(` DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;