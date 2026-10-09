const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Child = require('../models/Child');
const { reverseGeocode } = require('../services/geocoding.service');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/location-name', async (req, res) => {
  if (
    req.body?.lat === null || req.body?.lat === undefined || req.body?.lat === '' ||
    req.body?.lng === null || req.body?.lng === undefined || req.body?.lng === ''
  ) {
    return res.status(400).json({ message: 'Valid latitude and longitude are required.' });
  }
  const lat = Number(req.body?.lat);
  const lng = Number(req.body?.lng);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return res.status(400).json({ message: 'Valid latitude and longitude are required.' });
  }

  try {
    const address = await reverseGeocode(lat, lng);
    if (!address) {
      return res.status(502).json({ message: 'Could not resolve a place name for these coordinates.' });
    }
    res.json({ address });
  } catch (error) {
    console.error('Location lookup error:', error);
    res.status(502).json({ message: 'Location lookup is temporarily unavailable.' });
  }
});

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
      childCode,
      consentGiven,
    } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const normalizedChildCode = typeof childCode === 'string' ? childCode.trim().toUpperCase() : '';
    const linkedChild = normalizedChildCode
      ? await Child.findOne({ childCode: normalizedChildCode })
      : null;
    if (normalizedChildCode && !linkedChild) {
      return res.status(400).json({ message: 'Child code was not found' });
    }

    // Role validation — never allow self-promotion to admin via API
    const validRole = role === 'admin' ? 'guardian' : (role || 'guardian');

    let resolvedHomeAddress = homeAddress || null;
    if (!resolvedHomeAddress && homeLocation && homeLocation.lat && homeLocation.lng) {
      resolvedHomeAddress = await reverseGeocode(homeLocation.lat, homeLocation.lng);
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      role: validRole,
      relationship: relationship || 'guardian',
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      homeAddress: resolvedHomeAddress,
      homeLocation: homeLocation || { lat: null, lng: null },
      linkedChildId: linkedChild?._id,
      consentGiven: consentGiven === true,
      consentGivenAt: consentGiven === true ? new Date() : null,
    });
    await user.save();

    if (linkedChild) {
      try {
        linkedChild.linkedGuardianIds.addToSet(user._id);
        await linkedChild.save();
      } catch (error) {
        await User.deleteOne({ _id: user._id });
        throw error;
      }
    }

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

    let homeAddress = user.homeAddress;
    const homeLocation = user.homeLocation;
    if (!homeAddress && Number.isFinite(homeLocation?.lat) && Number.isFinite(homeLocation?.lng)) {
      homeAddress = await reverseGeocode(homeLocation.lat, homeLocation.lng);
    }

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: user.role,
        phone: user.phone,
        relationship: user.relationship,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        homeAddress,
        homeLocation,
        consentGiven: user.consentGiven,
        consentGivenAt: user.consentGivenAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Guardian alert channel preferences
const authenticateToken = require('../middleware/auth');
router.get('/alert-preferences', authenticateToken, async (req, res) => {
  if (req.user.role !== 'guardian') {
    return res.status(403).json({ message: 'Only guardians can manage alert preferences' });
  }

  try {
    const user = await User.findById(req.user.userId).select('alertPreferences');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      alertPreferences: {
        push: user.alertPreferences?.push ?? true,
        sms: user.alertPreferences?.sms ?? true,
        call: user.alertPreferences?.call ?? false,
      },
    });
  } catch (error) {
    console.error('Get alert preferences error:', error);
    res.status(500).json({ message: 'Failed to load alert preferences' });
  }
});

router.put('/alert-preferences', authenticateToken, async (req, res) => {
  if (req.user.role !== 'guardian') {
    return res.status(403).json({ message: 'Only guardians can manage alert preferences' });
  }

  const { push, sms, call } = req.body?.alertPreferences || {};
  if ([push, sms, call].some(value => typeof value !== 'boolean')) {
    return res.status(400).json({ message: 'Push, SMS, and call preferences must be boolean values' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { alertPreferences: { push, sms, call } },
      { new: true, runValidators: true, select: 'alertPreferences' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      alertPreferences: {
        push: user.alertPreferences.push,
        sms: user.alertPreferences.sms,
        call: user.alertPreferences.call,
      },
    });
  } catch (error) {
    console.error('Update alert preferences error:', error);
    res.status(500).json({ message: 'Failed to save alert preferences' });
  }
});

// Update FCM / Expo Push Token
router.put('/fcm-token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    await User.findByIdAndUpdate(req.user.userId, { fcmToken: token });
    res.json({ success: true, message: 'Push token updated' });
  } catch (error) {
    console.error('Update FCM Token error:', error);
    res.status(500).json({ message: 'Failed to update push token' });
  }
});

module.exports = router;
