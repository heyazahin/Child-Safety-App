import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../theme';
import { LanguageContext } from '../../context/LanguageContext';

export default function SplashOnboardingScreen({ navigation }) {
  const { t, language, changeLanguage } = useContext(LanguageContext);

  return (
    <View style={styles.container}>
      {/* Top Language Toggle */}
      <View style={styles.topBar}>
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

      {/* Main Center Branding matching Figma Splash */}
      <View style={styles.brandBox}>
        <View style={styles.iconCircle}>
          <Text style={styles.brandIcon}>🛡️</Text>
        </View>
        <Text style={styles.brandTitle}>{t('appName')}</Text>
        <Text style={styles.brandSubtitle}>{t('tagline')}</Text>
      </View>

      {/* Action Buttons matching Figma Splash Frame */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>🔑 {t('loginBtn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.secondaryBtnText}>📝 {t('registerBtn')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    marginLeft: 6,
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
  brandBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.mintBg,
    borderColor: COLORS.mint,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  brandIcon: {
    fontSize: 44,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomSection: {
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: COLORS.mint,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#0B132B',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.mint,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.mint,
    fontSize: 16,
    fontWeight: '800',
  },
});
