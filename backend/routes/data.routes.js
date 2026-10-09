const express = require('express');
const User = require('../models/User');
const Child = require('../models/Child');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');
const { detectDistress } = require('../services/detection.service');
const { sendSMS } = require('../services/sms.service');
const { makeCall } = require('../services/call.service');
const { sendPush } = require('../services/push.service');
const { resolveAlertLocation } = require('../services/alert-location.service');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const authenticateDevice = require('../middleware/deviceAuth');

const router = express.Router();

const notifyAlertRecipients = async (child, alertType, sensorValues, location) => {
  const guardianIds = child.linkedGuardianIds || [];
  const [guardians, admins] = await Promise.all([
    guardianIds.length ? User.find({ _id: { $in: guardianIds }, role: 'guardian' }) : [],
    User.find({ role: 'admin', fcmToken: { $nin: [null, ''] } })
  ]);

  const recipients = new Map();
  [...guardians, ...admins].forEach(user => recipients.set(user.id, user));
  const methodsFired = new Set();

  await Promise.all([...recipients.values()].map(async (recipient) => {
    const isGuardian = recipient.role === 'guardian';
    const preferences = recipient.alertPreferences || {};
    const results = await Promise.allSettled([
      isGuardian && recipient.phone && (preferences.sms ?? true)
        ? sendSMS(recipient.phone, child.name, sensorValues, alertType, location)
        : Promise.resolve(false),
      isGuardian && recipient.phone && (preferences.call ?? false)
        ? makeCall(recipient.phone, child.name, alertType, location)
        : Promise.resolve(false),
      recipient.fcmToken && (preferences.push ?? true)
        ? sendPush(recipient.fcmToken, child.name, alertType, location)
        : Promise.resolve(false)
    ]);

    if (results[0].status === 'fulfilled' && results[0].value) methodsFired.add('sms');
    if (results[1].status === 'fulfilled' && results[1].value) methodsFired.add('call');
    if (results[2].status === 'fulfilled' && results[2].value) methodsFired.add('push');
  }));

  return [...methodsFired];
};

// Device and admin sensor readings share the same validation and alert pipeline.
const handleIngest = async (req, res) => {
  try {
    const { childId, heartRate, gsr, respiration, motionLevel, source } = req.body;
    const sensorValues = [heartRate, gsr, respiration].map(Number);
    if (
      sensorValues.some(value => !Number.isFinite(value) || value < 0) ||
      !['low', 'medium', 'high'].includes(motionLevel)
    ) {
      return res.status(400).json({
        code: 'INVALID_SENSOR_READING',
        message: 'Provide non-negative numeric sensor values and a valid motionLevel.'
      });
    }

    if (!require('mongoose').Types.ObjectId.isValid(childId)) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const reading = new Reading({
      childId, heartRate, gsr, respiration, motionLevel,
      source: req.deviceAuthenticated ? 'hardware' : source || 'simulate',
      alertType: 'distress',
      timestamp: new Date()
    });

    const distressDetected = detectDistress(reading);
    let alertLoc = null;

    if (distressDetected) {
      alertLoc = await resolveAlertLocation(req.body.location || req.body);
      if (!alertLoc) {
        return res.status(400).json({
          code: 'LOCATION_REQUIRED',
          message: 'Fresh child GPS coordinates are required to send a distress alert.'
        });
      }
    }

    const now = new Date();
    reading.timestamp = now;
    await reading.save();

    if (distressDetected) {
      const alert = new Alert({
        childId, triggeredAt: now, severity: 'high', alertType: 'distress',
        sensorValues: { heartRate, gsr, respiration, motionLevel },
        location: alertLoc,
        alertMethodsFired: []
      });
      
      alert.alertMethodsFired = await notifyAlertRecipients(
        child, 'distress', alert.sensorValues, alertLoc
      );
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
};

router.post('/ingest', authenticateToken, authorizeRole('admin'), handleIngest);
router.post('/device/readings', authenticateDevice, handleIngest);

// Panic Button Alert (panic)
const handlePanic = async (req, res) => {
  try {
    let { childId } = req.body;
    const mongoose = require('mongoose');

    if (req.deviceAuthenticated && !childId) {
      return res.status(400).json({ code: 'CHILD_ID_REQUIRED', message: 'Device payload must include childId.' });
    }

    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      const firstChild = await Child.findOne();
      if (!firstChild) return res.status(404).json({ error: 'Child not found' });
      childId = firstChild._id;
    }

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    const alertLoc = await resolveAlertLocation(req.body.location || req.body);
    if (!alertLoc) {
      return res.status(400).json({
        code: 'LOCATION_REQUIRED',
        message: 'Fresh child GPS coordinates are required to send a panic alert.'
      });
    }

    const now = new Date();

    const reading = new Reading({
      childId,
      heartRate: 135,
      gsr: 0.9,
      respiration: 24,
      motionLevel: 'high',
      source: req.deviceAuthenticated ? 'hardware' : 'simulate',
      alertType: 'panic',
      timestamp: now
    });
    await reading.save();

    const alert = new Alert({
      childId,
      triggeredAt: now,
      severity: 'high',
      alertType: 'panic',
      sensorValues: { heartRate: 135, gsr: 0.9, respiration: 24, motionLevel: 'high' },
      location: alertLoc,
      alertMethodsFired: []
    });

    alert.alertMethodsFired = await notifyAlertRecipients(
      child, 'panic', alert.sensorValues, alertLoc
    );
    await alert.save();

    child.currentStatus = 'distress';
    child.lastReadingAt = now;
    await child.save();

    res.json({ received: true, alertType: 'panic', childId, timestamp: now.toISOString() });
  } catch (error) {
    console.error('Panic Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
router.post('/panic', authenticateToken, handlePanic);
router.post('/buttonpress', authenticateToken, handlePanic);
router.post('/device/panic', authenticateDevice, handlePanic);

// Tamper Detection Warning (tamper)
const handleTamper = async (req, res) => {
  try {
    let { childId } = req.body;
    const mongoose = require('mongoose');

    if (req.deviceAuthenticated && !childId) {
      return res.status(400).json({ code: 'CHILD_ID_REQUIRED', message: 'Device payload must include childId.' });
    }

    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      const firstChild = await Child.findOne();
      if (!firstChild) return res.status(404).json({ error: 'Child not found' });
      childId = firstChild._id;
    }

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    const alertLoc = await resolveAlertLocation(req.body.location || req.body);
    if (!alertLoc) {
      return res.status(400).json({
        code: 'LOCATION_REQUIRED',
        message: 'Fresh child GPS coordinates are required to send a tamper alert.'
      });
    }

    const now = new Date();

    const reading = new Reading({
      childId,
      heartRate: 0,
      gsr: 0,
      respiration: 0,
      motionLevel: 'low',
      source: req.deviceAuthenticated ? 'hardware' : 'simulate',
      alertType: 'tamper',
      timestamp: now
    });
    await reading.save();

    const alert = new Alert({
      childId,
      triggeredAt: now,
      severity: 'medium',
      alertType: 'tamper',
      sensorValues: { heartRate: 0, gsr: 0, respiration: 0, motionLevel: 'low' },
      location: alertLoc,
      alertMethodsFired: []
    });

    alert.alertMethodsFired = await notifyAlertRecipients(
      child, 'tamper', alert.sensorValues, alertLoc
    );
    await alert.save();

    child.currentStatus = 'tamper';
    child.lastReadingAt = now;
    await child.save();

    res.json({ received: true, alertType: 'tamper', childId, timestamp: now.toISOString() });
  } catch (error) {
    console.error('Tamper Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
router.post('/tamper', authenticateToken, handleTamper);
router.post('/bandremoval', authenticateToken, handleTamper);
router.post('/device/tamper', authenticateDevice, handleTamper);

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
    const child = await Child.findOne({ linkedGuardianIds: req.user.userId });
    if (!child) {
      return res.status(404).json({ error: 'No child found' });
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

router.get('/readings/:childId', authenticateToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { childId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({ message: 'Valid child ID is required' });
    }

    const childQuery = { _id: childId };
    if (req.user.role === 'guardian') {
      childQuery.linkedGuardianIds = req.user.userId;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view readings' });
    }

    const child = await Child.findOne(childQuery).select('_id');
    if (!child) {
      return res.status(404).json({ message: 'Linked child not found' });
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;
    const readings = await Reading.find({ childId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json(readings.reverse());
  } catch (error) {
    console.error('Failed to fetch reading history:', error);
    res.status(500).json({ message: 'Failed to fetch reading history' });
  }
});

// 5. Get Latest Reading for a Child
router.get('/latest/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({ message: 'Valid child ID is required' });
    }

    const childQuery = { _id: childId };
    if (req.user.role === 'guardian') {
      childQuery.linkedGuardianIds = req.user.userId;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view readings' });
    }

    const child = await Child.findOne(childQuery);
    if (!child) return res.status(404).json({ message: 'Linked child not found' });
    const reading = await Reading.findOne({ childId }).sort({ timestamp: -1 });
    
    res.json({
      child,
      latestReading: reading
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reading' });
  }
});

// 6. Get Alerts (All or by childId)
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    let childFilter = {};
    if (req.user.role === 'guardian') {
      const linkedChildren = await Child.find({ linkedGuardianIds: req.user.userId }).select('_id');
      childFilter = { childId: { $in: linkedChildren.map(child => child._id) } };
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view alerts' });
    }

    const alertsQuery = Alert.find(childFilter).populate('childId', 'name').sort({ triggeredAt: -1 });
    if (req.query.recent === 'true') alertsQuery.limit(25);
    const alerts = await alertsQuery;
    res.json(alerts);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/alerts/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const mongoose = require('mongoose');
    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      return res.json([]);
    }
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
    const users = await User.find({}, '-password -fcmToken');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
