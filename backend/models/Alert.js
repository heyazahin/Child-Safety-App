const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  triggeredAt: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  sensorValues: {
    heartRate: Number,
    gsr: Number,
    respiration: Number,
    motionLevel: String
  },
  alertMethodsFired: [{
    type: String,
    enum: ['sms', 'call', 'push']
  }],
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Alert', alertSchema);
