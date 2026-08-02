// Load environment variables from .env file FIRST, before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Create the Express app
const app = express();

// Middleware
app.use(cors()); // Allows frontend to talk to this backend
app.use(express.json()); // Allows server to read JSON data sent from frontend

// Simple test route to confirm server is working
app.get('/', (req, res) => {
  res.send('Mini Social Media API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/follow', require('./routes/followRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});