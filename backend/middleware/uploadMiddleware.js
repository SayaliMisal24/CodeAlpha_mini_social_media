const multer = require('multer');
const path = require('path');

// Configure where uploaded files are stored and how they're named
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save uploaded images into frontend/images so the frontend can display them directly
    cb(null, path.join(__dirname, '../../frontend/images'));
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + original extension
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;