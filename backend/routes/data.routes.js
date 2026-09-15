const express = require('express');
const User = require('../models/User');
const Child = require('../models/Child');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');
const { detectDistress } = require('../services/detection.service');
const { sendSMS } = require('../services/sms.service');
const { makeCall } = require('../services/call.service');
const { sendPush } = require('../services/push.service');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/role');

const router = express.Router();

// 1. Ingest Data (Admin / Device)
router.post('/ingest', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { childId, heartRate, gsr, respiration, motionLevel, source } = req.body;

    if (!require('mongoose').Types.ObjectId.isValid(childId)) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const now = new Date();

    const reading = new Reading({
      childId, heartRate, gsr, respiration, motionLevel,
      source: source || 'simulate', timestamp: now
    });
    await reading.save();

    const distressDetected = detectDistress(reading);

    if (distressDetected) {
      const alert = new Alert({
        childId, triggeredAt: now, severity: 'high',
        sensorValues: { heartRate, gsr, respiration, motionLevel },
        alertMethodsFired: []
      });
      
      const methodsFired = [];

      if (child.linkedGuardianIds && child.linkedGuardianIds.length > 0) {
        for (const guardianId of child.linkedGuardianIds) {
          const guardian = await User.findById(guardianId);
          if (guardian && guardian.phone) {
            const phone = guardian.phone;
            const fcmToken = guardian.fcmToken || null;
            const childName = child.name;

            const results = await Promise.allSettled([
              sendSMS(phone, childName, alert.sensorValues),
              makeCall(phone, childName),
              sendPush(fcmToken, childName)
            ]);

            if (results[0].status === 'fulfilled' && results[0].value) {
              if (!methodsFired.includes('sms')) methodsFired.push('sms');
            }
            if (results[1].status === 'fulfilled' && results[1].value) {
              if (!methodsFired.includes('call')) methodsFired.push('call');
            }
            if (results[2].status === 'fulfilled' && results[2].value) {
              if (!methodsFired.includes('push')) methodsFired.push('push');
            }
          }
        }
      }

      alert.alertMethodsFired = methodsFired;
      await alert.save();

      child.currentStatus = 'distress';
      child.lastReadingAt = now;
      await child.save();
    } else {
      child.currentStatus = 'safe';
      child.lastReadingAt = now;
      await child.save();
    }

    res.json({ received: true, distressDetected, childId, timestamp: now.toISOString() });
  } catch (error) {
    console.error('Ingest Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Get All Children
router.get('/children', authenticateToken, async (req, res) => {
  try {
    const children = await Child.find().populate('linkedGuardianIds', 'name email phone');
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// 3. Create New Child (Admin / Guardian)
router.post('/children', authenticateToken, async (req, res) => {
  try {
    const { name, age, school } = req.body;
    if (!name || !age) {
      return res.status(400).json({ error: 'Name and age are required' });
    }

    const child = new Child({
      name,
      age: Number(age),
      school: school || 'Springfield Elementary',
      linkedGuardianIds: req.user.role === 'guardian' ? [req.user.userId] : []
    });

    await child.save();
    res.status(201).json(child);
  } catch (error) {
    console.error('Error creating child:', error);
    res.status(500).json({ error: 'Failed to create child profile' });
  }
});

// 4. Get Guardian's Linked Child
router.get('/my-child', authenticateToken, async (req, res) => {
  try {
    let child = await Child.findOne({ linkedGuardianIds: req.user.userId });
    if (!child) {
      child = await Child.findOne();
    }
    if (!child) {
      return res.status(404).json({ error: 'No child found' });
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

// 5. Get Latest Reading for a Child
router.get('/latest/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const reading = await Reading.findOne({ childId }).sort({ timestamp: -1 });
    const child = await Child.findById(childId);
    
    res.json({
      child,
      latestReading: reading || {
        heartRate: 75,
        gsr: 0.35,
        respiration: 16,
        motionLevel: 'medium',
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reading' });
  }
});

// 6. Get Alerts (All or by childId)
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.find().populate('childId', 'name').sort({ triggeredAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/alerts/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const alerts = await Alert.find({ childId }).populate('childId', 'name').sort({ triggeredAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts for child' });
  }
});

// 7. Acknowledge Alert
router.patch('/alerts/:alertId/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.acknowledgedBy = req.user.userId;
    alert.acknowledgedAt = new Date();
    await alert.save();

    res.json({ message: 'Alert acknowledged successfully', alert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// 8. Get All Users (Admin)
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
