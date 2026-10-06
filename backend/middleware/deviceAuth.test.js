const test = require('node:test');
const assert = require('node:assert/strict');
const authenticateDevice = require('./deviceAuth');

const responseRecorder = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return response;
};

test('rejects device requests when no device key is configured', () => {
  delete process.env.DEVICE_API_KEY;
  const response = responseRecorder();
  let continued = false;

  authenticateDevice({ get: () => 'some-key' }, response, () => {
    continued = true;
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, 'DEVICE_AUTH_NOT_CONFIGURED');
  assert.equal(continued, false);
});

test('rejects an invalid device key', () => {
  process.env.DEVICE_API_KEY = 'correct-key';
  const response = responseRecorder();
  let continued = false;

  authenticateDevice({ get: () => 'wrong-key' }, response, () => {
    continued = true;
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.code, 'INVALID_DEVICE_KEY');
  assert.equal(continued, false);
});

test('authenticates a device with the configured key', () => {
  process.env.DEVICE_API_KEY = 'prototype-device-key';
  const request = { get: () => 'prototype-device-key' };
  const response = responseRecorder();
  let continued = false;

  authenticateDevice(request, response, () => {
    continued = true;
  });

  assert.equal(continued, true);
  assert.equal(request.deviceAuthenticated, true);
  assert.equal(response.statusCode, null);
});
