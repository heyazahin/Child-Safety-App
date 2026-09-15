import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../api';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, password, role: 'guardian' });
      Alert.alert('Success', 'Registered successfully! Please login.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
        <Button title="Register" onPress={handleRegister} />
      </View>
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff' },
  buttonContainer: { marginBottom: 15 }
});
