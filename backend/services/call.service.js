const twilio = require('twilio');
const { makeSim800Call } = require('./sim800l.service');

const makeCall = async (guardianPhone, childName, alertType = 'distress') => {
  try {
    // 1. Primary Call Mechanism: SIM800L Hardware
    const simResult = await makeSim800Call(guardianPhone);
    
    // If the hardware successfully initiated the call, we are done!
    if (simResult && !simResult.simulated) {
      return true;
    }

    // 2. Fallback Mechanism: Twilio (Used if SIM800L is disconnected/simulated)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('[Call Service] Twilio credentials missing. Relying on SIM800L simulation log only.');
      return false;
    }

    const client = twilio(accountSid, authToken);

    let message = `Alert! Your child ${childName} may be in distress. Please check on them immediately.`;
    if (alertType === 'panic') {
      message = `Emergency Panic Alert! Your child ${childName} pressed the panic button on their wristband. Please respond immediately.`;
    } else if (alertType === 'tamper') {
      message = `Tamper Warning! Someone is removing your child ${childName}'s wristband. Please check immediately.`;
    }
    
    // TwiML for speech synthesis
    const twiml = `<Response><Say>${message}</Say></Response>`;

    await client.calls.create({
      twiml: twiml,
      from: twilioPhone,
      to: guardianPhone
    });

    console.log(`[Twilio Fallback] Successfully initiated call to ${guardianPhone} for ${alertType}`);
    return true;
  } catch (error) {
    console.error(`[Call Service] Failed to make call to ${guardianPhone}:`, error.message);
    return false;
  }
};

module.exports = { makeCall };
