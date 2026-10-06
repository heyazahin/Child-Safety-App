# SafeNest hardware and prototype integration

## Data path

The wristband/device sends each sensor sample and its GPS fix to the backend over
Wi-Fi using HTTPS (or HTTP only on a trusted local prototype network). The
backend validates the device key, saves the reading, checks the configured
distress thresholds, resolves GPS coordinates to a nearby address, saves the
alert, then sends notifications to linked guardians and admins with registered
push tokens.

The device must send the child's own GPS fix. Guardian home addresses and
guardian phone GPS are never used as substitutes. A reading that triggers an
alert is rejected if its GPS fix is absent, invalid, or older than two minutes.
Keep the device clock synchronized (for example, by NTP) so `capturedAt` is
meaningful. If reverse geocoding is unavailable, the alert still carries the
exact coordinates and Google Maps link.

## Backend setup

1. Copy `.env.example` to `.env`; fill in `MONGO_URI`, a strong `JWT_SECRET`,
   and a separate random `DEVICE_API_KEY`. Keep `.env` private.
2. Start the backend with `npm install` then `npm start` (or `node server.js`).
   The backend host must be reachable from the device on port 5000.
3. Register/link the child to guardian accounts in the app. Configure guardian
   phone numbers for SMS/call. Admin accounts need to sign in on a physical
   device and grant push permission so their Expo push token can be registered.
4. Confirm the serial port and SIM800L power/network setup separately if using
   the optional call module. Calls are initiated by the backend host, not the
   wristband.

## Device API

Send JSON with `Content-Type: application/json` and the
`x-device-api-key: <DEVICE_API_KEY>` header. Each device request must include
the registered child's MongoDB `childId`.

### Sensor sample

`POST /api/data/device/readings`

```json
{
  "childId": "REPLACE_WITH_CHILD_OBJECT_ID",
  "heartRate": 135,
  "gsr": 0.85,
  "respiration": 28,
  "motionLevel": "high",
  "location": {
    "lat": 23.77226,
    "lng": 90.40725,
    "capturedAt": "2026-10-07T03:50:00.000Z"
  }
}
```

Allowed `motionLevel` values are `low`, `medium`, and `high`. An alert is
triggered when at least two configured signals cross thresholds in
`services/detection.service.js`. Send current GPS with every sample so any
abnormal sample can carry its contemporaneous location.

### Panic and tamper events

`POST /api/data/device/panic` and `POST /api/data/device/tamper` use the same
device-key header and JSON location object, plus `childId`. These events require
fresh GPS as well. Example panic event:

```json
{
  "childId": "REPLACE_WITH_CHILD_OBJECT_ID",
  "location": {
    "lat": 23.77226,
    "lng": 90.40725,
    "capturedAt": "2026-10-07T03:50:00.000Z"
  }
}
```

### Response handling

- `200`: event accepted. Reading requests include `distressDetected`; panic and
  tamper requests include their `alertType`.
- `400 LOCATION_REQUIRED`: get a new GPS fix and retry; don't resend an old fix.
- `400 CHILD_ID_REQUIRED` / `404`: correct device-to-child provisioning.
- `401 INVALID_DEVICE_KEY`: configure the matching device key.
- `503 DEVICE_AUTH_NOT_CONFIGURED`: set `DEVICE_API_KEY` on the backend.

Don't continuously retry an alert with a stale fix. For production or access
over the public internet, use HTTPS and provision a unique revocable credential
per device instead of sharing a prototype key.

## Prototype verification checklist

- [ ] Backend connects to MongoDB and is reachable on the device's network.
- [ ] Device sends a sample with its child ID, sensor values, coordinates, and
  synchronized `capturedAt`.
- [ ] A normal sample is saved without raising an alert.
- [ ] An abnormal sample with fresh GPS creates one alert with the matching
  coordinates, readable address when geocoding is available, and map link.
- [ ] The linked guardian receives configured SMS/call/push channels; logged-in
  admins with a registered push token receive a push notification.
- [ ] Panic and tamper events also include their event-time GPS location.
- [ ] Missing, out-of-range, or stale GPS is rejected for alert events.
- [ ] Invalid device keys are rejected.
- [ ] Missing/unconfigured device keys fail closed (503).

This repository provides the HTTP backend integration and simulator. It does
not contain wristband firmware or define sensor calibration; those must be
implemented and bench-tested for the selected sensor/GPS board.
