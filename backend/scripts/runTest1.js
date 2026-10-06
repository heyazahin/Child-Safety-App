const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

const runTest1 = async () => {
  console.log('----------------------------------------------------');
  console.log('🧪 TEST 1: Registration Flow (End-to-End Test)');
  console.log('----------------------------------------------------');

  try {
    console.log('1. Connecting to MongoDB Atlas database...');
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is undefined in .env file!');
    }
    await mongoose.connect(MONGO_URI);
    console.log('   ✅ Successfully connected to MongoDB Atlas!');

    const testEmail = `guardian_test_${Date.now()}@safenest.com`;
    console.log(`\n2. Registering new Guardian User: ${testEmail}...`);

    const newUser = new User({
      name: 'Sarah Connor',
      email: testEmail,
      phone: '+8801711223344',
      password: 'GuardianPassword123!',
      role: 'guardian',
      relationship: 'mother',
      emergencyContactName: 'John Connor',
      emergencyContactPhone: '+8801822334455',
      homeAddress: 'House 42, Road 11, Dhanmondi, Dhaka',
      homeLocation: { lat: 23.7461, lng: 90.3742 },
      consentGiven: true,
      consentGivenAt: new Date()
    });

    const savedUser = await newUser.save();
    console.log('   ✅ Guardian User successfully registered and saved to MongoDB Atlas!');

    console.log('\n3. Querying MongoDB Atlas database to confirm record creation:');
    const queriedUser = await User.findById(savedUser._id).select('-password');
    
    console.log('   MongoDB Document Found:');
    console.log(JSON.stringify(queriedUser, null, 2));

    console.log('\n----------------------------------------------------');
    console.log('🎉 TEST 1 PASSED: Registration flow verified in MongoDB Atlas!');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTest1();
