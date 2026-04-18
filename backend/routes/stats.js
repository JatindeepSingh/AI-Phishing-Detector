const express = require('express');
const Scan = require('../models/Scan');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/stats
// @desc  Get user's scan statistics
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalScans, verdictBreakdown, typeBreakdown, recentActivity] = await Promise.all([
      Scan.countDocuments({ userId }),

      Scan.aggregate([
        { $match: { userId } },
        { $group: { _id: '$result.verdict', count: { $sum: 1 } } }
      ]),

      Scan.aggregate([
        { $match: { userId } },
        { $group: { _id: '$inputType', count: { $sum: 1 } } }
      ]),

      Scan.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': -1 } },
        { $limit: 7 }
      ])
    ]);

    // Format verdict breakdown
    const verdicts = { safe: 0, suspicious: 0, phishing: 0 };
    verdictBreakdown.forEach(v => { verdicts[v._id] = v.count; });

    // Format type breakdown
    const types = { url: 0, email: 0, text: 0 };
    typeBreakdown.forEach(t => { types[t._id] = t.count; });

    // Avg risk score
    const avgRisk = await Scan.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: '$result.riskScore' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalScans,
        verdicts,
        types,
        avgRiskScore: avgRisk[0]?.avg?.toFixed(1) || 0,
        recentActivity: recentActivity.reverse(),
        threatRate: totalScans > 0
          ? (((verdicts.phishing + verdicts.suspicious) / totalScans) * 100).toFixed(1)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;