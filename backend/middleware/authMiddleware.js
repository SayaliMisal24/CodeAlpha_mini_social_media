const jwt = require('jsonwebtoken');

// This function runs BEFORE a protected route.
// It checks if a valid JWT token was sent with the request.
const protect = (req, res, next) => {
  let token;

  // Tokens are sent in the header like: "Authorization: Bearer xxxxx"
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Extract just the token part (remove "Bearer ")
      token = authHeader.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the logged-in user's ID to the request object
      // so controllers can know WHO is making the request
      req.userId = decoded.id;

      next(); // token is valid, continue to the actual route
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = protect;