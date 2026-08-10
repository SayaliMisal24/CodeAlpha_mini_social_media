const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
// @desc   Create a new post
// @route  POST /api/posts
const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption && !req.file) {
      return res.status(400).json({ message: 'Post must have a caption or an image' });
    }

    const post = await Post.create({
  userId: req.userId,
  caption: caption || '',
  image: req.file ? req.file.filename : '',// Cloudinary gives the full URL in req.file.path
  });

    // Return the post with user info attached
    const populatedPost = await Post.findById(post._id).populate(
      'userId',
      'name username profileImage'
    );

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all posts (the home feed), newest first
// @route  GET /api/posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name username profileImage createdAt')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'name username' },
      });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Delete a post (only the owner can delete it)
// @route  DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only the post's owner is allowed to delete it
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Comment.deleteMany({ postId: post._id }); // clean up related comments
    await post.deleteOne();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Like or unlike a post
// @route  POST /api/posts/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(req.userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);

      // Create a notification (but not if you liked your own post)
      if (post.userId.toString() !== req.userId) {
        await Notification.create({
          recipient: post.userId,
          sender: req.userId,
          type: 'like',
          postId: post._id,
        });
      }
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Add a comment to a post
// @route  POST /api/posts/:id/comment
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = await Comment.create({
      userId: req.userId,
      postId: post._id,
      comment,
    });

    post.comments.push(newComment._id);
    await post.save();

    // Create a notification (but not if you commented on your own post)
    if (post.userId.toString() !== req.userId) {
      await Notification.create({
        recipient: post.userId,
        sender: req.userId,
        type: 'comment',
        postId: post._id,
      });
    }

    const populatedComment = await newComment.populate('userId', 'name username');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @desc   Edit a post's caption
// @route  PUT /api/posts/:id
const editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    post.caption = req.body.caption;
    await post.save();

    res.status(200).json({ message: 'Post updated', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
  module.exports = { createPost, getPosts, deletePost, toggleLike, addComment, editPost };