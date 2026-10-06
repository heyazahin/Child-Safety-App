import React, { createContext, useState, useEffect } from 'react';
import safeStorage from '../utils/storage';

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
      const savedToken = await safeStorage.getItem('token');
      const savedRole = await safeStorage.getItem('role');
      const savedUser = await safeStorage.getItem('user');

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

      await safeStorage.setItem('token', authToken);
      await safeStorage.setItem('role', userRole);
      await safeStorage.setItem('user', JSON.stringify(userObj));
    } catch (error) {
      console.error('Error saving login session:', error);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      setRole(null);

      await safeStorage.removeItem('token');
      await safeStorage.removeItem('role');
      await safeStorage.removeItem('user');
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
