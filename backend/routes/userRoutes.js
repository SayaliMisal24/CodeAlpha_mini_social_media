const express = require('express');
const router = express.Router();
const { searchUsers, getUserById, getSuggestedUsers } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getSuggestedUsers);
router.get('/:id', protect, getUserById);

module.exports = router;