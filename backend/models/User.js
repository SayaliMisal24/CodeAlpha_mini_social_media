const mongoose = require('mongoose');

// This defines the "shape" of a User document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // no two users can have the same username
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // will be stored as a bcrypt hash, never plain text
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '', // will store a URL or filename later
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // references other User documents
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);