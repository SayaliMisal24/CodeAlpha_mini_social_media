const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../controllers/followController');
const protect = require('../middleware/authMiddleware');

router.post('/:id', protect, followUser); // follow
router.post('/:id/unfollow', protect, unfollowUser); // unfollow
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

module.exports = router;