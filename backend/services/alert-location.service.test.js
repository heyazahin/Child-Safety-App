const test = require('node:test');
const assert = require('node:assert/strict');
const { isFreshLocation } = require('./alert-location.service');

const now = Date.parse('2026-10-07T00:00:00.000Z');
const currentLocation = {
  lat: 23.77226,
  lng: 90.40725,
  capturedAt: new Date(now).toISOString(),
};

test('accepts a GPS fix captured now', () => {
  assert.equal(isFreshLocation(currentLocation, now), true);
});

test('rejects a missing capture timestamp', () => {
  const { capturedAt, ...location } = currentLocation;
  assert.equal(isFreshLocation(location, now), false);
});

test('rejects a GPS fix older than two minutes', () => {
  const location = { ...currentLocation, capturedAt: new Date(now - 120001).toISOString() };
  assert.equal(isFreshLocation(location, now), false);
});

test('rejects coordinates outside valid latitude/longitude ranges', () => {
  assert.equal(isFreshLocation({ ...currentLocation, lat: 91 }, now), false);
  assert.equal(isFreshLocation({ ...currentLocation, lng: 181 }, now), false);
});
