const express = require('express');
const Scan = require('../models/Scan');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/history
// @desc  Get user's scan history (paginated)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    // Optional filters
    if (req.query.verdict) filter['result.verdict'] = req.query.verdict;
    if (req.query.type) filter.inputType = req.query.type;

    const total = await Scan.countDocuments(filter);
    const scans = await Scan.find(filter)
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-mlFeatures');

    res.json({
      success: true,
      scans,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/history/:id
// @desc  Delete a scan from history
router.delete('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    res.json({ success: true, message: 'Scan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/history
// @desc  Clear all user history
router.delete('/', protect, async (req, res) => {
  try {
    await Scan.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;