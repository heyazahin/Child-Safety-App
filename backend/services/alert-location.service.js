const { reverseGeocode } = require('./geocoding.service');

const isFreshLocation = (location, now = Date.now()) => {
  if (
    !location ||
    location.lat === null ||
    location.lat === undefined ||
    location.lng === null ||
    location.lng === undefined ||
    location.lat === '' ||
    location.lng === '' ||
    !Number.isFinite(Number(location.lat)) ||
    !Number.isFinite(Number(location.lng))
  ) return false;

  const lat = Number(location.lat);
  const lng = Number(location.lng);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;

  const capturedAt = new Date(location.capturedAt).getTime();
  const ageMs = now - capturedAt;
  return Number.isFinite(capturedAt) && ageMs >= -30000 && ageMs <= 120000;
};

const resolveAlertLocation = async (location) => {
  if (!isFreshLocation(location)) return null;

  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const capturedAt = new Date(location.capturedAt);
  const address = await reverseGeocode(lat, lng);
  return {
    lat,
    lng,
    capturedAt,
    address,
    source: 'alert',
    googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
  };
};

module.exports = { isFreshLocation, resolveAlertLocation };
