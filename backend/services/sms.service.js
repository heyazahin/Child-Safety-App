const twilio = require('twilio');

const sendSMS = async (guardianPhone, childName, sensorValues) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('[SMS Service] Twilio credentials missing. Skipping SMS.');
      return false;
    }

    const client = twilio(accountSid, authToken);
    const timestamp = new Date().toLocaleString();

    const messageBody = `⚠️ DISTRESS ALERT
Child: ${childName}
Time: ${timestamp}
Heart Rate: ${sensorValues.heartRate} bpm
GSR: ${sensorValues.gsr}
Respiration: ${sensorValues.respiration}
Motion: ${sensorValues.motionLevel}
Please check on your child immediately.`;

    await client.messages.create({
      body: messageBody,
      from: twilioPhone,
      to: guardianPhone
    });

    console.log(`[SMS Service] Successfully sent SMS to ${guardianPhone}`);
    return true;
  } catch (error) {
    console.error(`[SMS Service] Failed to send SMS to ${guardianPhone}:`, error.message);
    return false;
  }
};

module.exports = { sendSMS };
