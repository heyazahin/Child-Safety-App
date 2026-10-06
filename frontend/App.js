import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';
import { usePushNotifications } from './src/hooks/usePushNotifications';

function PushNotificationManager({ children }) {
  usePushNotifications();
  return <>{children}</>;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PushNotificationManager>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </PushNotificationManager>
      </AuthProvider>
    </LanguageProvider>
  );
}

