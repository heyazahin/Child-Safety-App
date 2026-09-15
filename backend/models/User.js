const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['guardian', 'admin'],
    default: 'guardian',
  },
  phone: {
    type: String
  },

  // --- Guardian Profile Fields ---
  relationship: {
    type: String,
    enum: ['father', 'mother', 'guardian', 'teacher', 'other'],
    default: 'guardian'
  },

  // Emergency backup contact
  emergencyContactName: {
    type: String,
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    trim: true
  },

  // Guardian's registered home/base location (for emergency reference)
  homeAddress: {
    type: String,
    trim: true
  },
  homeLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },

  // Consent tracking — GDPR/COPPA compliance
  consentGiven: {
    type: Boolean,
    default: false
  },
  consentGivenAt: {
    type: Date,
    default: null
  },

  // Device push token for notifications
  linkedChildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  },
  fcmToken: {
    type: String
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
