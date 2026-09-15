import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import AdminDashboard from '../screens/admin/AdminDashboard';
import ChildrenListScreen from '../screens/admin/ChildrenListScreen';
import UsersListScreen from '../screens/admin/UsersListScreen';
import SimulateScreen from '../screens/admin/SimulateScreen';
import AllAlertsScreen from '../screens/admin/AllAlertsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import { COLORS } from '../theme';
import { LanguageContext } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  const { t } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let icon = '📊';
          if (route.name === 'Children') icon = '👶';
          if (route.name === 'Users') icon = '👥';
          if (route.name === 'Simulate') icon = '🧪';
          if (route.name === 'Alerts') icon = '🚨';
          if (route.name === 'AdminSettings') icon = '⚙️';
          return <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>{icon}</Text>;
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
        name="Overview"
        component={AdminDashboard}
        options={{ tabBarLabel: t('tabHome') }}
      />
      <Tab.Screen
        name="Children"
        component={ChildrenListScreen}
        options={{ tabBarLabel: t('tabChildren') }}
      />
      <Tab.Screen
        name="Users"
        component={UsersListScreen}
        options={{ tabBarLabel: t('tabUsers') }}
      />
      <Tab.Screen
        name="Simulate"
        component={SimulateScreen}
        options={{ tabBarLabel: t('tabSimulate') }}
      />
      <Tab.Screen
        name="Alerts"
        component={AllAlertsScreen}
        options={{ tabBarLabel: t('tabAlerts') }}
      />
      <Tab.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}
