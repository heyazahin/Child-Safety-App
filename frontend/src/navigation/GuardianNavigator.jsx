import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import GuardianDashboard from '../screens/guardian/GuardianDashboard';
import LiveMonitorScreen from '../screens/guardian/LiveMonitorScreen';
import AlertHistoryScreen from '../screens/guardian/AlertHistoryScreen';
import GuardianSettingsScreen from '../screens/guardian/GuardianSettingsScreen';
import { COLORS } from '../theme';
import { LanguageContext } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export default function GuardianNavigator() {
  const { t } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let icon = '🏠';
          if (route.name === 'Monitor') icon = '📈';
          if (route.name === 'Alerts') icon = '🔔';
          if (route.name === 'Settings') icon = '⚙️';
          return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{icon}</Text>;
        },
        tabBarActiveTintColor: COLORS.mint,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={GuardianDashboard}
        options={{ tabBarLabel: t('tabHome') }}
      />
      <Tab.Screen
        name="Monitor"
        component={LiveMonitorScreen}
        options={{ tabBarLabel: t('tabMonitor') }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertHistoryScreen}
        options={{ tabBarLabel: t('tabAlerts') }}
      />
      <Tab.Screen
        name="Settings"
        component={GuardianSettingsScreen}
        options={{ tabBarLabel: t('tabSettings') }}
      />
    </Tab.Navigator>
  );
}
