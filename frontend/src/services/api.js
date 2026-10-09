import axios from 'axios';
import safeStorage from '../utils/storage';
import { Platform } from 'react-native';

// Dynamically handle Web (localhost/hostname) vs Physical Phone (LAN IP)
const LOCAL_IP = '192.168.0.101';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname)
      ? window.location.hostname
      : 'localhost';
    return `http://${hostname}:5000/api`;
  }
  return `http://${LOCAL_IP}:5000/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use(async (config) => {
  const token = await safeStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (registrationData) => {
  const response = await api.post('/auth/register', registrationData);
  return response.data;
};

export const getLocationName = async ({ lat, lng }) => {
  const response = await api.post('/auth/location-name', { lat, lng });
  return response.data.address;
};

export const getMyChild = async () => {
  const response = await api.get('/data/my-child');
  return response.data;
};

export const getLatestReading = async (childId) => {
  const response = await api.get(`/data/latest/${childId}`);
  return response.data;
};

export const getReadingHistory = async (childId, limit = 20) => {
  const response = await api.get(`/data/readings/${childId}`, { params: { limit } });
  if (!Array.isArray(response.data)) {
    throw new Error('The server returned an invalid reading history.');
  }
  return response.data;
};

export const getAlertPreferences = async () => {
  const response = await api.get('/auth/alert-preferences');
  return response.data.alertPreferences;
};

export const updateAlertPreferences = async (alertPreferences) => {
  const response = await api.put('/auth/alert-preferences', { alertPreferences });
  return response.data.alertPreferences;
};

export const getAlertHistory = async (childId) => {
  try {
    const response = await api.get(childId ? `/data/alerts/${childId}` : '/data/alerts');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn('getAlertHistory failed:', error?.message);
    return [];
  }
};

export const acknowledgeAlert = async (alertId) => {
  const response = await api.patch(`/data/alerts/${alertId}/acknowledge`);
  return response.data;
};

export const simulateDistress = async (childId, sensorValues, location) => {
  const response = await api.post('/data/ingest', {
    childId,
    ...sensorValues,
    location,
    source: 'simulate'
  });
  return response.data;
};

export const simulatePanic = async (childId, location) => {
  const response = await api.post('/data/panic', { childId, location });
  return response.data;
};
export const simulateButtonPress = simulatePanic;

export const simulateTamper = async (childId, location) => {
  const response = await api.post('/data/tamper', { childId, location });
  return response.data;
};
export const simulateBandRemoval = simulateTamper;

export const getAllChildren = async () => {
  try {
    const response = await api.get('/data/children');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn('getAllChildren failed:', error?.message);
    return [];
  }
};

export const createChild = async (name, age, school) => {
  const response = await api.post('/data/children', { name, age, school });
  return response.data;
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/data/users');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn('getAllUsers failed:', error?.message);
    return [];
  }
};

export const getAllAlerts = async () => {
  try {
    const response = await api.get('/data/alerts');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn('getAllAlerts failed:', error?.message);
    return [];
  }
};

export default api;
