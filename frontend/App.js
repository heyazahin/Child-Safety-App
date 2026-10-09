import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';
import GuardianAlertBanner from './src/components/GuardianAlertBanner';
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
          <React.Fragment>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <GuardianAlertBanner />
          </React.Fragment>
        </PushNotificationManager>
      </AuthProvider>
    </LanguageProvider>
  );
}
