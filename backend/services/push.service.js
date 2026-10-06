const axios = require('axios');

const sendPush = async (fcmToken, childName, alertType = 'distress', location = null) => {
  try {
    if (!fcmToken || !fcmToken.startsWith('ExponentPushToken')) {
      console.warn('[Push Service] Invalid or missing Expo Push Token. Skipping push.');
      return false;
    }
    
    const mapsLink = location?.lat && location?.lng 
      ? ` https://maps.google.com/?q=${location.lat},${location.lng}`
      : '';

    let title = '⚠️ DISTRESS ALERT';
    let body = `${childName} may be in distress.${mapsLink}`;

    if (alertType === 'panic') {
      title = '🆘 PANIC ALERT';
      body = `${childName} pressed panic button.${mapsLink}`;
    } else if (alertType === 'tamper') {
      title = '⚡ TAMPER WARNING';
      body = `Someone is removing ${childName}'s wristband.${mapsLink}`;
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
