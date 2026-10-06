import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { LanguageContext } from '../context/LanguageContext';

export default function StatusCard({ status, childName, childAge, lastUpdated }) {
  const { t, language } = useContext(LanguageContext);

  const normStatus = (status || 'safe').toLowerCase();

  let accentColor = COLORS.mint;
  let badgeBg = COLORS.mintBg;
  let badgeText = `• ${t('statusSafe')}`;

  if (normStatus === 'alert' || normStatus === 'typeb' || normStatus === 'panic') {
    accentColor = '#EF4444';
    badgeBg = '#FEF2F2';
    badgeText = language === 'bn' ? '• PANIC — জরুরি বোতাম টিপা হয়েছে' : '• PANIC — Check immediately';
  } else if (normStatus === 'tamper' || normStatus === 'typec') {
    accentColor = '#F59E0B';
    badgeBg = '#FFFBEB';
    badgeText = language === 'bn' ? '• TEMPER — রিস্টব্যান্ড খোলার সংকেত' : '• Wristband being removed';
  } else if (normStatus === 'distress' || normStatus === 'typea') {
    accentColor = '#DC2626';
    badgeBg = '#FEF2F2';
    badgeText = language === 'bn' ? '• DISTRESS — বিপদ সংকেত' : '• Distress detected';
  }

  const getInitials = (name) => {
    if (!name) return 'ET';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTimeAgo = () => {
    if (!lastUpdated) return language === 'bn' ? 'সম্প্রতি' : '2 min ago';
    const mins = Math.floor((new Date() - new Date(lastUpdated)) / 60000);
    if (mins < 1) return language === 'bn' ? 'এইমাত্র' : 'Just now';
    return language === 'bn' ? `${mins} মিনিট আগে` : `${mins} min ago`;
  };

  const isDistress = normStatus !== 'safe';

  return (
    <View style={[styles.card, isDistress && styles.distressCard]}>
      <View style={styles.leftCol}>
        <View style={[styles.avatar, { backgroundColor: badgeBg }]}>
          <Text style={[styles.avatarText, { color: accentColor }]}>
            {getInitials(childName)}
          </Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.childName}>{childName || 'Emma T.'}</Text>
          <Text style={styles.updatedText}>
            {language === 'bn' ? 'হালনাগাদ:' : 'Last updated:'} {getTimeAgo()}
          </Text>
        </View>
      </View>

      <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: accentColor }]}>
        <Text style={[styles.badgeText, { color: accentColor }]}>{badgeText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  distressCard: {
    borderColor: COLORS.distress,
    backgroundColor: COLORS.distressBg,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoCol: {},
  childName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  updatedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
