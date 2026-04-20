const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputType: {
    type: String,
    enum: ['url', 'email', 'text'],
    required: true
  },
  inputContent: {
    type: String,
    required: true
  },
  result: {
    verdict: {
      type: String,
      enum: ['safe', 'suspicious', 'phishing'],
      required: true
    },
    confidence: {
      type: Number, // 0-100
      required: true
    },
    riskScore: {
      type: Number, // 0-100
      required: true
    },
    flags: [String], // Array of detected issues
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  mlFeatures: {
    type: mongoose.Schema.Types.Mixed // Store extracted features
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Scan || mongoose.model('Scan', scanSchema);