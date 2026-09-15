import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import TopHeader from '../../components/TopHeader';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { getMyChild } from '../../services/api';
import { COLORS } from '../../theme';

export default function GuardianSettingsScreen() {
  const { user, logout } = useContext(AuthContext);
  const { t, language, changeLanguage } = useContext(LanguageContext);
  const [child, setChild] = useState(null);

  // Preference Toggle States matching Figma
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [callEnabled, setCallEnabled] = useState(false);

  useEffect(() => {
    getMyChild().then(setChild).catch(console.error);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.screen}>
      <TopHeader 
        title={language === 'bn' ? 'অভিভাবক সেটিংস' : 'Guardian Settings'} 
        subtitle={language === 'bn' ? 'সিস্টেম ও ডিসপ্যাচ সেটিংস' : 'Alert preferences & device linkage'}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* User Profile Card matching Figma guardian-settings */}
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{getInitials(user?.name || 'Sarah Thompson')}</Text>
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.userName}>{user?.name || 'Sarah Thompson'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'sarah.thompson@gmail.com'}</Text>
          </View>
        </View>

        {/* Language Selection Row */}
        <Text style={styles.sectionTitle}>🌐 {t('languageLabel')}</Text>
        <View style={styles.langSelectorRow}>
          <TouchableOpacity
            style={[styles.langBtn, language === 'bn' && styles.activeLangBtn]}
            onPress={() => changeLanguage('bn')}
          >
            <Text style={[styles.langBtnText, language === 'bn' && styles.activeLangBtnText]}>
              🇧🇩 বাংলা
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, language === 'en' && styles.activeLangBtn]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.langBtnText, language === 'en' && styles.activeLangBtnText]}>
              🇺🇸 English
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alert Preferences Section matching Figma guardian-settings */}
        <Text style={styles.sectionTitle}>ALERT PREFERENCES</Text>

        <View style={styles.cardBox}>
          {/* Push Notifications Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>Push Notifications</Text>
              <Text style={styles.switchSub}>Immediate distress & anomaly alerts</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.rowDivider} />

          {/* SMS Emergency Alerts Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>SMS Emergency Alerts</Text>
              <Text style={styles.switchSub}>Backup SMS triggers when offline</Text>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Emergency Call Route Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>Emergency Call Route</Text>
              <Text style={styles.switchSub}>Automated SOS phone sequence</Text>
            </View>
            <Switch
              value={callEnabled}
              onValueChange={setCallEnabled}
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Linked Monitor Section matching Figma */}
        <Text style={styles.sectionTitle}>LINKED MONITOR</Text>

        <View style={styles.linkedCard}>
          <View style={styles.watchIconBox}>
            <Text style={styles.watchIcon}>⌚</Text>
          </View>
          <View style={styles.linkedInfo}>
            <Text style={styles.linkedName}>{child?.name || 'Emma T.'}</Text>
            <Text style={styles.linkedDetail}>
              {child?.school || 'Grade 3 • Lincoln Elementary'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        {/* Sign Out Button matching Figma light mint style */}
        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Text style={styles.signOutText}>
            {language === 'bn' ? 'অ্যাকাউন্ট থেকে লগ আউট করুন' : 'Sign Out of Account'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16 },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
  },
  profileTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 10,
  },
  langSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  langBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeLangBtn: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeLangBtnText: {
    color: '#10B981',
    fontWeight: '800',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  switchInfo: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  switchSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  watchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  watchIcon: {
    fontSize: 16,
  },
  linkedInfo: {
    flex: 1,
  },
  linkedName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  linkedDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  signOutBtn: {
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  signOutText: {
    color: '#065F46',
    fontSize: 15,
    fontWeight: '800',
  },
});
