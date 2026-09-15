import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashOnboardingScreen from '../screens/shared/SplashOnboardingScreen';
import LoginScreen from '../screens/shared/LoginScreen';
import RegisterScreen from '../screens/shared/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashOnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

