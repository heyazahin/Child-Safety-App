const twilio = require('twilio');

const makeCall = async (guardianPhone, childName) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('[Call Service] Twilio credentials missing. Skipping Call.');
      return false;
    }

    const client = twilio(accountSid, authToken);
    const message = `Alert. Your child ${childName} may be in distress. Please check on them immediately. This is an automated message from the Child Safety Monitoring System.`;
    
    // TwiML for speech synthesis
    const twiml = `<Response><Say>${message}</Say></Response>`;

    await client.calls.create({
      twiml: twiml,
      from: twilioPhone,
      to: guardianPhone
    });

    console.log(`[Call Service] Successfully initiated call to ${guardianPhone}`);
    return true;
  } catch (error) {
    console.error(`[Call Service] Failed to make call to ${guardianPhone}:`, error.message);
    return false;
  }
};

module.exports = { makeCall };
