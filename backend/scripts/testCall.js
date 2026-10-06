require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { makeCall } = require('../services/call.service');

const testGuardianPhone = process.argv[2] || '+8801700000000'; // Default test number or pass via CLI
const testChildName = 'Emma (Test)';

const runTest = async () => {
  console.log('==============================================');
  console.log('🧪 SAFENEST CALL SERVICE TEST SCRIPT');
  console.log('==============================================');
  
  console.log(`\nTesting call dispatch to: ${testGuardianPhone}`);
  console.log('This will attempt to use the SIM800L module first. If disconnected, it runs in simulation mode, and falls back to Twilio (if credentials exist).\n');

  // Triggering the call service
  const result = await makeCall(testGuardianPhone, testChildName, 'distress');

  if (result) {
    console.log('\n✅ Call Service dispatch completed successfully.');
  } else {
    console.log('\n❌ Call Service dispatch failed.');
  }

  // Allow time for the serial port to write and any timeouts to trigger before exiting immediately
  setTimeout(() => {
    process.exit(0);
  }, 2000);
};

runTest();
