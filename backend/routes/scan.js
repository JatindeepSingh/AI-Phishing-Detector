const express = require('express');
const Scan = require('../models/Scan');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { detectPhishing } = require('../ml/detector');

const router = express.Router();

// @route POST /api/scan
// @desc  Run phishing detection on input
router.post('/', protect, async (req, res) => {
  try {
    const { inputType, content } = req.body;

    if (!inputType || !content) {
      return res.status(400).json({ success: false, message: 'inputType and content are required' });
    }

    if (!['url', 'email', 'text'].includes(inputType)) {
      return res.status(400).json({ success: false, message: 'inputType must be url, email, or text' });
    }

    if (content.length > 50000) {
      return res.status(400).json({ success: false, message: 'Content too long (max 50,000 chars)' });
    }

    // Run AI detection
    const result = detectPhishing(inputType, content);

    // Save to DB
    const scan = await Scan.create({
      userId: req.user._id,
      inputType,
      inputContent: content.substring(0, 2000), // Store first 2000 chars
      result,
      mlFeatures: result.details
    });

    // Increment user scan count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalScans: 1 } });

    res.json({
      success: true,
      scanId: scan._id,
      result,
      scannedAt: scan.scannedAt
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ success: false, message: 'Detection failed: ' + error.message });
  }
});

// @route GET /api/scan/:id
// @desc  Get single scan result
router.get('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    res.json({ success: true, scan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;