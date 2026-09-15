const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  heartRate: {
    type: Number,
    required: true
  },
  gsr: {
    type: Number,
    required: true
  },
  respiration: {
    type: Number,
    required: true
  },
  motionLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['simulate', 'hardware'],
    default: 'simulate'
  }
});

module.exports = mongoose.model('Reading', readingSchema);
