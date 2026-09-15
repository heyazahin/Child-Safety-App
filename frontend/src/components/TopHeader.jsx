import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { LanguageContext } from '../context/LanguageContext';

export default function TopHeader({ title, subtitle, isDistress = false, rightElement, badge }) {
  const { language, changeLanguage } = useContext(LanguageContext);
  const accentColor = isDistress ? COLORS.distress : COLORS.mint;

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <View style={styles.headerWrapper}>
      {/* Top Accent Line */}
      <View style={[styles.topBar, { backgroundColor: accentColor }]} />
      <SafeAreaView>
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{title}</Text>
              {badge && <View style={styles.badgeContainer}>{badge}</View>}
            </View>
            {subtitle && (
              <Text style={styles.subtitleText}>{subtitle}</Text>
            )}
          </View>

          <View style={styles.rightContainer}>
            {/* Language Toggle Pill */}
            <TouchableOpacity style={styles.langPill} onPress={toggleLanguage}>
              <Text style={[styles.langText, language === 'en' && styles.activeLang]}>EN</Text>
              <Text style={styles.langDivider}>|</Text>
              <Text style={[styles.langText, language === 'bn' && styles.activeLang]}>বাংলা</Text>
            </TouchableOpacity>

            {rightElement && <View style={styles.customRight}>{rightElement}</View>}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBar: {
    height: 3,
    width: '100%',
  },
  headerContainer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  badgeContainer: {
    marginLeft: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeLang: {
    color: COLORS.mint,
    fontWeight: '800',
  },
  langDivider: {
    fontSize: 11,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  customRight: {
    marginLeft: 10,
  }
});
