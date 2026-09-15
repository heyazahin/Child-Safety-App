import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSavedToken();
  }, []);

  const checkSavedToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const savedRole = await AsyncStorage.getItem('role');
      const savedUser = await AsyncStorage.getItem('user');

      if (savedToken && savedRole) {
        setToken(savedToken);
        setRole(savedRole);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      console.error('Error loading token from AsyncStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authToken, userObj, userRole) => {
    try {
      setToken(authToken);
      setUser(userObj);
      setRole(userRole);

      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('role', userRole);
      await AsyncStorage.setItem('user', JSON.stringify(userObj));
    } catch (error) {
      console.error('Error saving login session:', error);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      setRole(null);

      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
