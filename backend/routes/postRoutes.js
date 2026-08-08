const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  deletePost,
  toggleLike,
  addComment,
  editPost,
} = require('../controllers/postController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All post routes require the user to be logged in
router.post('/', protect, upload.single('image'), createPost); // 'image' = form field name
router.get('/', protect, getPosts);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.put('/:id', protect, editPost);
module.exports = router;