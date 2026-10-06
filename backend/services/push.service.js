const axios = require('axios');

const sendPush = async (fcmToken, childName, alertType = 'distress', location = null) => {
  try {
    if (!fcmToken || !fcmToken.startsWith('ExponentPushToken')) {
      console.warn('[Push Service] Invalid or missing Expo Push Token. Skipping push.');
      return false;
    }
    
    const mapsLink = location?.lat != null && location?.lng != null
      ? ` https://maps.google.com/?q=${location.lat},${location.lng}`
      : '';
    const locationText = location?.address
      ? ` Child location at alert time: ${location.address}.${mapsLink}`
      : mapsLink
        ? ` Child location coordinates at alert time: ${location.lat}, ${location.lng}.${mapsLink}`
        : ' Child location unavailable.';

    let title = '⚠️ DISTRESS ALERT';
    let body = `${childName} may be in distress.${locationText}`;

    if (alertType === 'panic') {
      title = '🆘 PANIC ALERT';
      body = `${childName} pressed panic button.${locationText}`;
    } else if (alertType === 'tamper') {
      title = '⚡ TAMPER WARNING';
      body = `Someone is removing ${childName}'s wristband.${locationText}`;
    }

    const message = {
      to: fcmToken,
      sound: 'default',
      title: title,
      body: body,
      data: { alertType, location },
    };

    await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      }
    });

    console.log(`[Push Service] Successfully sent push notification to Expo token ${fcmToken.substring(0, 25)}...`);
    return true;
  } catch (error) {
    console.error(`[Push Service] Failed to send push to token:`, error.message);
    return false;
  }
};

module.exports = { sendPush };
