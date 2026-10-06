import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Linking, Alert } from 'react-native';
import safeStorage from '../utils/storage';

export default function DashboardScreen({ navigation }) {
  const [role, setRole] = useState('');

  useEffect(() => {
    safeStorage.getItem('role').then(setRole);
  }, []);

  const handleLogout = async () => {
    await safeStorage.removeItem('token');
    await safeStorage.removeItem('role');
    navigation.replace('Login');
  };

  const handleTestCall = async () => {
    const url = 'tel:+8801700000000'; // Replace with a real number if desired
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Your device/emulator does not support phone calls.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome! You are logged in as: {role}</Text>
      
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>
          This is where we will display the child's status, heart rate, and alert history in Step 6!
        </Text>
      </View>

      <View style={styles.buttonSpacing}>
        <Button title="📞 Test Call Dialer" onPress={handleTestCall} color="#007BFF" />
      </View>
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 40, color: 'gray' },
  placeholderContainer: { padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 40 },
  placeholderText: { fontSize: 16, textAlign: 'center', color: '#333' },
  buttonSpacing: { marginBottom: 20, width: '100%' }
});
