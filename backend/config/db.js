// This file handles connecting our backend to the MongoDB database
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect uses the MONGO_URI from our .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    // Stop the app if the database fails to connect
    process.exit(1);
  }
};

module.exports = connectDB;