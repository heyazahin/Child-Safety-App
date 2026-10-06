const crypto = require('crypto');

const authenticateDevice = (req, res, next) => {
  const configuredKey = process.env.DEVICE_API_KEY;
  if (!configuredKey) {
    return res.status(503).json({ code: 'DEVICE_AUTH_NOT_CONFIGURED', message: 'Device API is not configured.' });
  }

  const providedKey = req.get('x-device-api-key') || '';
  const configuredBuffer = Buffer.from(configuredKey);
  const providedBuffer = Buffer.from(providedKey);

  if (
    configuredBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(configuredBuffer, providedBuffer)
  ) {
    return res.status(401).json({ code: 'INVALID_DEVICE_KEY', message: 'Invalid device API key.' });
  }

  req.deviceAuthenticated = true;
  next();
};

module.exports = authenticateDevice;
