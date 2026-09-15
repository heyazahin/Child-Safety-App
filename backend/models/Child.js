const mongoose = require('mongoose');
const crypto = require('crypto');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  school: {
    type: String,
    trim: true
  },
  childCode: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase() // E.g., 8A2B9C1F
  },
  linkedGuardianIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Health & safety fields
  bloodGroup: {
    type: String,
    trim: true,
    default: null
  },
  medicalNotes: {
    type: String,
    trim: true,
    default: null
  },

  currentStatus: {
    type: String,
    enum: ['safe', 'distress', 'offline'],
    default: 'offline'
  },
  lastReadingAt: {
    type: Date
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Child', childSchema);
