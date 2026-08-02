const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function: creates a JWT token for a given user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc   Register a new user
// @route  POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    // 1. Validate required fields
    if (!name || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Validate email format using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 4. Check passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // 5. Check if user already exists (by email or username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already in use' });
    }

    // 6. Hash the password before saving (never store plain text passwords)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Create the user in the database
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // 8. Generate a login token right away so the user is auto-logged-in
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Login an existing user
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Compare the entered password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Generate a token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get logged-in user's profile
// @route  GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    // req.userId was attached by our authMiddleware
    const user = await User.findById(req.userId)
      .select('-password') // never send the password back
      .populate('followers', 'name username')
      .populate('following', 'name username');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Update logged-in user's profile
// @route  PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update fields that were actually provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signup, login, getProfile, updateProfile };