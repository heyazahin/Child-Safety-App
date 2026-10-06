import { useState, useEffect, useRef, useContext } from 'react';
import { Platform, Vibration, Alert } from 'react-native';
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
      const alertType = notification.request.content.data?.alertType;
      console.log('🔔 Foreground Notification Received!', notification);

      // Heavily vibrate the phone if it's a distress/panic/tamper alert
      if (['distress', 'panic', 'tamper'].includes(alertType)) {
        Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        // Also show an in-app alert dialog to force the user to see it
        Alert.alert(
          notification.request.content.title || "Emergency",
          notification.request.content.body || "Please check the dashboard immediately."
        );
      } else {
        // Standard notification vibration
        Vibration.vibrate();
      }
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
      vibrationPattern: [0, 250, 250, 250],
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
