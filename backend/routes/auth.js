const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Register route
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, phone, password, role,
      // New guardian profile fields
      relationship,
      emergencyContactName,
      emergencyContactPhone,
      homeAddress,
      homeLocation,       // { lat, lng }
      consentGiven,
    } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role validation — never allow self-promotion to admin via API
    const validRole = role === 'admin' ? 'guardian' : (role || 'guardian');

    const user = new User({
      name,
      email,
      phone,
      password,
      role: validRole,
      relationship: relationship || 'guardian',
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      homeAddress: homeAddress || null,
      homeLocation: homeLocation || { lat: null, lng: null },
      consentGiven: consentGiven === true,
      consentGivenAt: consentGiven === true ? new Date() : null,
    });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with role embedded
    const payload = {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, role: user.role, user: { id: user._id, email: user.email, name: user.name || user.email.split('@')[0], role: user.role, phone: user.phone } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
