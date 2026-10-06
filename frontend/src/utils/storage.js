import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage = new Map();

const safeStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryStorage.get(key) || null;
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          return window.localStorage.getItem(key);
        } catch (_) {}
      }
      return memoryStorage.get(key) || null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
        memoryStorage.set(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(key, value);
          return;
        } catch (_) {}
      }
      memoryStorage.set(key, value);
    }
  },

  removeItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
        memoryStorage.delete(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(key);
          return;
        } catch (_) {}
      }
      memoryStorage.delete(key);
    }
  },

  clear: async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
          return;
        }
        memoryStorage.clear();
        return;
      }
      await AsyncStorage.clear();
    } catch (e) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.clear();
          return;
        } catch (_) {}
      }
      memoryStorage.clear();
    }
  }
};

export default safeStorage;
