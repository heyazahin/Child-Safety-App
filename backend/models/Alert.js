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
  alertType: {
    type: String,
    enum: ['distress', 'panic', 'tamper'],
    default: 'distress'
  },
  sensorValues: {
    heartRate: Number,
    gsr: Number,
    respiration: Number,
    motionLevel: String
  },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: null },
    googleMapsUrl: { type: String, default: null }
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
