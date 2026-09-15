import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
  const [role, setRole] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('role').then(setRole);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    navigation.replace('Login');
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

      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 40, color: 'gray' },
  placeholderContainer: { padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 40 },
  placeholderText: { fontSize: 16, textAlign: 'center', color: '#333' }
});
