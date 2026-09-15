require('dotenv').config();
const mongoose = require('mongoose');

async function testAlerts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get Admin token
    let res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@project.com', password: 'AdminPassword123!' })
    });
    const adminToken = (await res.json()).token;

    // Get the child we will test with
    const Child = require('../models/Child');
    const child = await Child.findOne();
    const childId = child._id.toString();

    console.log(`Sending distress data for child: ${childId}`);
    
    res = await fetch('http://127.0.0.1:5000/api/data/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        childId,
        heartRate: 135,
        gsr: 0.85,
        respiration: 28,
        motionLevel: 'low',
        source: 'simulate'
      })
    });

    console.log(`Status: ${res.status}`);
    console.log('Response:', await res.json());

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

testAlerts();
