const axios = require('axios');
const twilio = require('twilio');

const sendSMS = async (guardianPhone, childName, sensorValues, alertType = 'distress', location = null) => {
  try {
    const timestamp = new Date().toLocaleString();
    const mapsLink = location?.lat && location?.lng 
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : null;
    
    let locString = '';
    if (location?.address) {
      locString = `\nLocation: ${location.address} (${mapsLink})`;
    } else if (mapsLink) {
      locString = `\nLocation: ${mapsLink}`;
    }

    let messageBody = '';
    if (alertType === 'panic') {
      messageBody = `[SafeNest] 🆘 PANIC ALERT: ${childName} pressed panic button on wristband at ${timestamp}.${locString} Check immediately.`;
    } else if (alertType === 'tamper') {
      messageBody = `[SafeNest] ⚡ TAMPER WARNING: ${childName}'s wristband was removed at ${timestamp}.${locString} Check immediately.`;
    } else {
      messageBody = `[SafeNest] ⚠️ DISTRESS ALERT: ${childName} may be in distress at ${timestamp}.${locString} Heart Rate: ${sensorValues?.heartRate || 'Spike'} bpm. Check immediately.`;
    }

    // 1. Try Muthofun BD SMS Gateway (Recommended for +880 Bangladesh Numbers)
    const muthofunApiKey = process.env.MUTHOFUN_API_KEY;
    if (muthofunApiKey) {
      await axios.get('https://api.muthofun.com/sms/', {
        params: {
          api_key: muthofunApiKey,
          type: 'text',
          contacts: guardianPhone,
          senderid: 'SafeNest',
          msg: messageBody
        }
      });
      console.log(`[Muthofun SMS BD] Successfully sent SMS with location to ${guardianPhone}`);
      return true;
    }

    // 2. Fallback to Twilio (if Twilio credentials are defined)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: messageBody,
        from: twilioPhone,
        to: guardianPhone
      });
      console.log(`[Twilio SMS] Successfully sent SMS with location to ${guardianPhone}`);
      return true;
    }

    console.log(`[SMS Service] Simulation Mode. SMS Payload for ${guardianPhone}: "${messageBody}"`);
    return true;
  } catch (error) {
    console.error(`[SMS Service] Failed to send SMS to ${guardianPhone}:`, error.message);
    return false;
  }
};

module.exports = { sendSMS };
