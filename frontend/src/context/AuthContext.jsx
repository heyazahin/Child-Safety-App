import React, { createContext, useState, useEffect } from 'react';
import safeStorage from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startSignedOut();
  }, []);

  const startSignedOut = async () => {
    try {
      await Promise.all([
        safeStorage.removeItem('token'),
        safeStorage.removeItem('role'),
        safeStorage.removeItem('user'),
      ]);
    } catch (error) {
      console.error('Error clearing saved session:', error);
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
