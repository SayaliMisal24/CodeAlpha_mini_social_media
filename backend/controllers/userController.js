const User = require('../models/User');

// @desc   Search users by username or name
// @route  GET /api/users/search?q=searchTerm
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(200).json([]);
    }

    // Case-insensitive search on username or name, excluding the current user
    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    }).select('name username profileImage');

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get any user's public profile by ID
// @route  GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name username profileImage')
      .populate('following', 'name username profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { searchUsers, getUserById };