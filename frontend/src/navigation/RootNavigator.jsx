import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

import SplashScreen from '../screens/shared/SplashScreen';
import AuthNavigator from './AuthNavigator';
import GuardianNavigator from './GuardianNavigator';
import AdminNavigator from './AdminNavigator';

export default function RootNavigator() {
  const { token, role, loading } = useContext(AuthContext);

  if (loading) {
    return <SplashScreen />;
  }

  if (!token) {
    return <AuthNavigator />;
  }

  if (role === 'admin') {
    return <AdminNavigator />;
  }

  return <GuardianNavigator />;
}
