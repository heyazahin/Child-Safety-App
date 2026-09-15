import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
}

