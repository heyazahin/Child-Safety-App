import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { LanguageContext } from '../context/LanguageContext';

export default function AlertCard({ alert, onAcknowledge, showGuardianName = false }) {
  const { t, language } = useContext(LanguageContext);

  const isAcknowledged = !!alert.acknowledgedAt;
  const severity = alert.severity || 'high';

  // Left border accent color matching Figma (red = high, amber = medium, green = low/info)
  const accentColor =
    severity === 'high'
      ? '#EF4444'
      : severity === 'medium'
      ? '#F59E0B'
      : '#10B981';

  // Alert title — bilingual
  const titleMap = {
    high: {
      en: 'Elevated Heart Rate',
      bn: 'হৃদস্পন্দন বৃদ্ধি পেয়েছে',
    },
    medium: {
      en: 'Unusual Motion Pattern',
      bn: 'অস্বাভাবিক চলাচল সংকেত',
    },
    low: {
      en: 'Device Connected',
      bn: 'ডিভাইস সংযুক্ত হয়েছে',
    },
  };
  const title = (titleMap[severity] || titleMap.high)[language] || (titleMap[severity] || titleMap.high).en;

  // Alert description — bilingual
  const getDescription = () => {
    if (alert.sensorValues) {
      return language === 'bn'
        ? `হৃদস্পন্দন ${alert.sensorValues.heartRate} bpm-এ পৌঁছেছে। ত্বক পরিবাহিতা বেড়েছে। বর্ধিত মানসিক চাপ শনাক্ত।`
        : `Heart rate spiked to ${alert.sensorValues.heartRate} bpm. GSR skin conductivity spike detected. Child is exhibiting elevated stress.`;
    }
    if (severity === 'medium') {
      return language === 'bn'
        ? 'উচ্চ ত্বরণ নমুনা রেকর্ড করা হয়েছে। ডিভাইস দ্রুত নাড়াচাড়া বা দৌড়ানো শনাক্ত করেছে।'
        : 'High acceleration pattern recorded. Device registers rapid shaking or running.';
    }
    return language === 'bn'
      ? 'ওয়্যারেবল নিরাপদ হ্যান্ডশেক সম্পন্ন। সকল ডেটা স্ট্রিম সফলভাবে চলছে।'
      : 'Wearable secure handshake complete. All metrics streaming successfully.';
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
          <Text style={styles.alertTitle}>{title}</Text>
        </View>
        <Text style={styles.timeText}>{timeStr}</Text>
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
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
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
    color: '#111827',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  childName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    marginLeft: 16,
  },
  descText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 12,
    marginLeft: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ackLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
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
});
