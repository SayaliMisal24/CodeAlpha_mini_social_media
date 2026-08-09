const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure storage to upload directly to Cloudinary instead of local disk
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bondly', // all uploads go into a "bondly" folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }], // avoid huge files
  },
});

const upload = multer({ storage });

module.exports = upload;