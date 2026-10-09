import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { loginUser } from '../../services/api';
import { COLORS, GLOBAL_STYLES } from '../../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('admin@project.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useContext(AuthContext);
  const { t, language, changeLanguage } = useContext(LanguageContext);

  const handleLogin = async (overrideEmail, overridePassword) => {
    setErrorMessage('');
    const targetEmail = (overrideEmail || email).trim();
    const targetPassword = overridePassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMessage(language === 'bn' ? 'দয়া করে ইমেইল ও পাসওয়ার্ড প্রদান করুন' : 'Please enter email and password');
      return;
    }

    try {
      setSubmitting(true);
      const data = await loginUser(targetEmail.toLowerCase(), targetPassword);
      await login(data.token, data.user, data.role);
    } catch (error) {
      console.error('Login failed:', error);
      const msg = error.response?.data?.message 
        || (error.message === 'Network Error' 
            ? (language === 'bn' ? 'সার্ভারে সংযোগ করা যাচ্ছে না। ব্যাকএন্ড চালু আছে কিনা পরীক্ষা করুন।' : 'Unable to connect to server. Please ensure backend is running.')
            : error.message) 
        || 'Login failed';
      setErrorMessage(msg);
      if (typeof Alert !== 'undefined' && Alert.alert) {
        Alert.alert('Login Failed', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Language Switcher */}
      <View style={styles.langBar}>
        <TouchableOpacity
          style={[styles.langPill, language === 'bn' && styles.activeLangPill]}
          onPress={() => changeLanguage('bn')}
        >
          <Text style={[styles.langPillText, language === 'bn' && styles.activeLangPillText]}>
            🇧🇩 বাংলা
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.langPill, language === 'en' && styles.activeLangPill]}
          onPress={() => changeLanguage('en')}
        >
          <Text style={[styles.langPillText, language === 'en' && styles.activeLangPillText]}>
            🇺🇸 English
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoRow}>
        <Text style={styles.logoText}>{t('appName')}</Text>
      </View>

      <Text style={styles.heading}>{t('loginBtn')}</Text>
      <Text style={styles.subtext}>{t('tagline')}</Text>

      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{t('email')}</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{t('password')}</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {!!errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={GLOBAL_STYLES.button} 
        onPress={() => handleLogin()} 
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={GLOBAL_STYLES.buttonText}>{t('loginBtn')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
        <Text style={styles.linkText}>{t('noAccount')}</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.adminLabel}>{t('roleAdmin')}</Text>
      <TouchableOpacity 
        style={GLOBAL_STYLES.buttonOutlined} 
        onPress={() => handleLogin('admin@project.com', 'AdminPassword123!')}
      >
        <Text style={GLOBAL_STYLES.buttonOutlinedText}>⚡ DEMO ADMIN LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  langBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  activeLangPill: {
    borderColor: COLORS.mint,
    backgroundColor: COLORS.mintBg,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeLangPillText: {
    color: COLORS.mint,
    fontWeight: '800',
  },
  logoRow: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  fieldCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.mint,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  adminLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: COLORS.distressBg || '#FEF2F2',
    borderColor: COLORS.distress || '#EF4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: COLORS.distress || '#EF4444',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
