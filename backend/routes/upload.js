const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// @route   POST /api/upload/profile-image
// @desc    Upload profile image
// @access  Private
router.post('/profile-image', protect, (req, res, next) => {
  console.log('Received upload request');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload middleware error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }

    console.log('Upload middleware processed successfully');
    next();
  });
}, async (req, res) => {
  try {
    console.log('Processing upload request, file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Create URL for the uploaded file
    const fileUrl = `/uploads/profiles/${req.file.filename}`;

    console.log('File uploaded successfully:', req.file);
    console.log('File URL:', fileUrl);

    res.json({
      success: true,
      fileUrl: fileUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
