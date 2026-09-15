import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Dynamically handle Web (localhost) vs Physical Phone (LAN IP)
const LOCAL_IP = '192.168.0.105';
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : `http://${LOCAL_IP}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
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

export const getMyChild = async () => {
  try {
    const response = await api.get('/data/my-child');
    return response.data;
  } catch (error) {
    console.warn('getMyChild failed:', error?.message);
    return null;
  }
};

export const getLatestReading = async (childId) => {
  try {
    const response = await api.get(`/data/latest/${childId}`);
    return response.data;
  } catch (error) {
    console.warn('getLatestReading failed:', error?.message);
    return { latestReading: { heartRate: 75, gsr: 0.35, respiration: 16, motionLevel: 'medium' } };
  }
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

export const simulateDistress = async (childId, sensorValues) => {
  const response = await api.post('/data/ingest', {
    childId,
    ...sensorValues,
    source: 'simulate'
  });
  return response.data;
};

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
