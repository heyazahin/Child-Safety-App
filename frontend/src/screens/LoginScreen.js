import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export default function LoginScreen({ navigation }) {
  // Pre-filled with your seeded admin for easy testing
  const [email, setEmail] = useState('admin@project.com');
  const [password, setPassword] = useState('AdminPassword123!');

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('role', response.data.role);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Check your network and try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
      </View>
      <Button title="Don't have an account? Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff' },
  buttonContainer: { marginBottom: 15 }
});
