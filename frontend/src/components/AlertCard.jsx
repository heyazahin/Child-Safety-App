import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { LanguageContext } from '../context/LanguageContext';

export default function AlertCard({ alert, onAcknowledge, showGuardianName = false }) {
  const { t, language } = useContext(LanguageContext);

  const isAcknowledged = !!alert.acknowledgedAt;
  const severity = alert.severity || 'high';

  const alertType = alert.alertType || 'distress';
  const isPanic = alertType === 'panic' || alertType === 'typeB';
  const isTamper = alertType === 'tamper' || alertType === 'typeC';

  // Left border accent color matching Figma (red = high, amber = medium, green = low/info)
  const accentColor = isPanic
    ? '#EF4444'
    : isTamper
    ? '#F59E0B'
    : severity === 'high'
    ? COLORS.distress
    : severity === 'medium'
    ? COLORS.amber
    : COLORS.secondary;

  // Alert title — bilingual
  const getTitle = () => {
    if (isPanic) return language === 'bn' ? 'জরুরি বোতাম টিপা হয়েছে' : 'Emergency Button Pressed';
    if (isTamper) return language === 'bn' ? 'রিস্টব্যান্ড সরানো হয়েছে' : 'Wristband Removed';
    const titleMap = {
      high: { en: 'Unusual Vital Reading', bn: 'হৃদস্পন্দন বৃদ্ধি পেয়েছে' },
      medium: { en: 'Unusual Motion Pattern', bn: 'অস্বাভাবিক চলাচল সংকেত' },
      low: { en: 'Device Connected', bn: 'ডিভাইস সংযুক্ত হয়েছে' },
    };
    return (titleMap[severity] || titleMap.high)[language] || (titleMap[severity] || titleMap.high).en;
  };

  // Alert description — bilingual
  const getDescription = () => {
    if (isPanic) {
      return language === 'bn'
        ? 'শিশুর রিস্টব্যান্ডের জরুরি বোতাম টিপা হয়েছে। দ্রুত অবস্থান পরীক্ষা করুন।'
        : 'Emergency button was pressed on child wristband. Check status immediately.';
    }
    if (isTamper) {
      return language === 'bn'
        ? 'শিশুর রিস্টব্যান্ডটি খোলার বা সরানোর সংকেত পাওয়া গিয়েছে।'
        : 'Child wristband has been unbuckled or removed. Please verify safety.';
    }
    if (alert.sensorValues && alert.sensorValues.heartRate) {
      return language === 'bn'
        ? `হৃদস্পন্দন ${alert.sensorValues.heartRate} bpm-এ পৌঁছেছে। ত্বক পরিবাহিতা বেড়েছে। বর্ধিত মানসিক চাপ শনাক্ত।`
        : `Heart rate spiked to ${alert.sensorValues.heartRate} bpm. GSR skin conductivity spike detected. Child is exhibiting elevated stress.`;
    }
    return language === 'bn'
      ? 'ওয়্যারেবল সেন্সর অস্বাভাবিক সংকেত শনাক্ত করেছে।'
      : 'Unusual reading detected from child wristband.';
  };

  const renderBadge = () => {
    if (isPanic) {
      return (
        <View style={[styles.typeBadge, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.typeBadgeText}>{t('badgeTypeB')}</Text>
        </View>
      );
    }
    if (isTamper) {
      return (
        <View style={[styles.typeBadge, { backgroundColor: '#F59E0B' }]}>
          <Text style={styles.typeBadgeText}>{t('badgeTypeC')}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.typeBadge, { backgroundColor: '#DC2626' }]}>
        <Text style={styles.typeBadgeText}>{t('badgeTypeA')}</Text>
      </View>
    );
  };

  const dateStr = new Date(alert.triggeredAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = new Date(alert.triggeredAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      {/* Title row */}
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <Text style={styles.alertTitle}>{getTitle()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {renderBadge()}
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>
      </View>

      {/* Optional guardian/child name for admin view */}
      {showGuardianName && alert.childId?.name && (
        <Text style={styles.childName}>👦 {alert.childId.name}</Text>
      )}

      {/* Description */}
      <Text style={styles.descText}>{getDescription()}</Text>

      {/* Bottom row — date + acknowledge */}
      <View style={styles.bottomRow}>
        <Text style={styles.dateText}>{dateStr}</Text>

        {isAcknowledged ? (
          <Text style={styles.ackLabel}>
            {language === 'bn' ? '✓ গৃহীত হয়েছে' : '✓ Acknowledged'}
          </Text>
        ) : (
          onAcknowledge && (
            <TouchableOpacity
              style={[styles.ackBtn, { backgroundColor: accentColor }]}
              onPress={() => onAcknowledge(alert._id)}
            >
              <Text style={styles.ackBtnText}>
                {language === 'bn' ? 'স্বীকার করুন' : 'Acknowledge'}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderLeftWidth: 4,          // Figma-style colored left accent bar
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  childName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginLeft: 16,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
    marginLeft: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardHeader,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ackLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  ackBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  ackBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
