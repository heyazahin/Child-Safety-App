const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../config/firebase-key.json');

try {
  const apps = admin.apps || [];
  if (apps.length === 0 && fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
} catch (error) {
  console.warn('[Push Service] Firebase initialization failed:', error.message);
}

const sendPush = async (fcmToken, childName) => {
  try {
    if (!fcmToken || fcmToken === 'test-token-placeholder') {
      console.warn('[Push Service] Invalid or placeholder FCM token. Skipping push.');
      return false;
    }
    
    const apps = admin.apps || [];
    if (apps.length === 0) {
       console.warn('[Push Service] Firebase not initialized. Skipping push.');
       return false;
    }

    const message = {
      notification: {
        title: '⚠️ Child Safety Alert',
        body: `${childName} may be in distress. Open app immediately.`
      },
      token: fcmToken
    };

    await admin.messaging().send(message);
    console.log(`[Push Service] Successfully sent push notification to token ${fcmToken.substring(0, 10)}...`);
    return true;
  } catch (error) {
    console.error(`[Push Service] Failed to send push to token:`, error.message);
    return false;
  }
};

module.exports = { sendPush };
