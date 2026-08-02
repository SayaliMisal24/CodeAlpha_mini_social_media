const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // every post must belong to a user
    },
    caption: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '', // optional image URL/filename
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // list of users who liked this post
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', // list of comments on this post
      },
    ],
  },
  { timestamps: true } // adds createdAt automatically
);

module.exports = mongoose.model('Post', postSchema);