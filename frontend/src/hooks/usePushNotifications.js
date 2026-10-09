import { useState, useEffect, useRef, useContext } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// Configures what happens when a notification is received while the app is FORGROUNDED.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const { token } = useContext(AuthContext); // Get JWT token
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!token || Platform.OS === 'web') return;

    registerForPushNotificationsAsync().then(async (pushToken) => {
      if (pushToken) {
        setExpoPushToken(pushToken);
        // Send the token to the backend
        try {
          await api.put('/auth/fcm-token', { token: pushToken });
          console.log('✅ Push token registered with backend:', pushToken);
        } catch (error) {
          console.error('❌ Failed to register push token with backend', error);
        }
      }
    });

    // 1. FOREGROUND LISTENER (Fires when app is open)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Foreground Notification Received!', notification);
    });

    // 2. RESPONSE LISTENER (Fires when user taps a notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 User tapped notification:', response);
      // Navigation routing could go here (e.g. force navigate to Dashboard)
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [token]);

  return { expoPushToken };
};

// Internal helper to get token
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    // projectId requires app.json expo.extra.eas.projectId, which might not exist in dev yet.
    // So we use standard getExpoPushTokenAsync which works out of the box in Expo Go.
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
    } catch(e) {
        console.warn('Error getting expo token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
