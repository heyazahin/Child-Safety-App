import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>🛡️</Text>
      </View>
      <Text style={styles.title}>SafeGuard</Text>
      <Text style={styles.subtitle}>CHILD SAFETY MONITORING SYSTEM</Text>
      <ActivityIndicator size="small" color={COLORS.mint} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.cardHeader,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 22,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: COLORS.fontMono,
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 6,
    letterSpacing: 1,
  },
});
