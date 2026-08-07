const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, updateProfilePhoto } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/photo', protect, upload.single('profileImage'), updateProfilePhoto);

module.exports = router;