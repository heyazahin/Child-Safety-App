const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let port = null;
let parser = null;
let isConnected = false;

const portPath = process.env.SIM800L_PORT || 'COM5';
const baudRate = parseInt(process.env.SIM800L_BAUD_RATE || '9600', 10);

const initSim800L = () => {
  try {
    port = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false
    });

    parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    port.open((err) => {
      if (err) {
        console.warn(`[SIM800L] Hardware not detected on ${portPath}. Running in SIMULATION mode.`);
        isConnected = false;
        return;
      }
      console.log(`[SIM800L] Hardware connected on ${portPath} at ${baudRate} baud.`);
      isConnected = true;

      // Basic Initialization Tests
      sendCommand('AT');
      setTimeout(() => sendCommand('AT+CSQ'), 1000); // Check signal quality
      setTimeout(() => sendCommand('AT+CREG?'), 2000); // Check network registration
    });

    parser.on('data', (data) => {
      const response = data.toString().trim();
      if (response) {
        console.log(`[SIM800L] Response: ${response}`);
      }
    });

    port.on('error', (err) => {
      console.error(`[SIM800L] Serial error:`, err.message);
      isConnected = false;
    });

  } catch (error) {
    console.warn(`[SIM800L] Initialization failed: ${error.message}. Running in SIMULATION mode.`);
    isConnected = false;
  }
};

const sendCommand = (cmd) => {
  if (isConnected && port) {
    port.write(`${cmd}\r\n`, (err) => {
      if (err) {
        console.error(`[SIM800L] Failed to write command ${cmd}:`, err.message);
      }
    });
  }
};

// Normalize Bangladeshi numbers (017... to +88017...)
const normalizePhone = (phone) => {
  let p = phone.trim();
  if (p.startsWith('01')) {
    p = '+88' + p;
  }
  return p;
};

const makeSim800Call = async (guardianPhone) => {
  return new Promise((resolve) => {
    const formattedPhone = normalizePhone(guardianPhone);
    
    if (!isConnected) {
      console.log(`[SIM800L Simulation] Dialing ${formattedPhone}...`);
      return resolve({ success: true, simulated: true });
    }

    console.log(`[SIM800L] Dialing ${formattedPhone}...`);
    sendCommand(`ATD${formattedPhone};`);

    // Hangup logic: wait 30 seconds for the call, then hang up.
    // In the future, this can parse 'NO CARRIER' or 'BUSY' from the parser.
    setTimeout(() => {
      console.log(`[SIM800L] Hanging up call to ${formattedPhone}`);
      sendCommand('ATH');
      resolve({ success: true, simulated: false });
    }, 30000);
  });
};

// Initialize port on module load
initSim800L();

module.exports = { makeSim800Call };
