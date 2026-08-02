const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

// Public routes (no login required)
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (must be logged in — token required)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;