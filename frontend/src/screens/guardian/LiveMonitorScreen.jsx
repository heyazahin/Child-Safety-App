import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopHeader from '../../components/TopHeader';
import { getMyChild, getLatestReading } from '../../services/api';
import { COLORS } from '../../theme';
import { LanguageContext } from '../../context/LanguageContext';

export default function LiveMonitorScreen() {
  const { t, language } = useContext(LanguageContext);
  const [child, setChild] = useState(null);
  const [reading, setReading] = useState(null);

  const fetchLiveReading = async () => {
    try {
      const childData = await getMyChild();
      setChild(childData);
      if (childData && childData._id) {
        const readingData = await getLatestReading(childData._id);
        setReading(readingData.latestReading);
      }
    } catch (error) {
      console.error('Error polling live reading:', error);
    }
  };

  useEffect(() => {
    fetchLiveReading();
    const interval = setInterval(fetchLiveReading, 5000);
    return () => clearInterval(interval);
  }, []);

  const isDistress = child?.currentStatus?.toLowerCase() === 'distress';

  return (
    <View style={styles.screen}>
      <TopHeader
        title={t('tabMonitor')}
        subtitle={language === 'bn' ? 'প্রতি ৫ সেকেন্ডে লাইভ রিডিং' : 'Real-time 5s vitals stream'}
        isDistress={isDistress}
        badge={
          <View style={styles.liveStreamBadge}>
            <Text style={styles.liveStreamBadgeText}>• LIVE STREAM</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* ECG Hero Card matching Figma live-monitor frame */}
        <View style={styles.ecgCard}>
          <View style={styles.ecgHeader}>
            <View>
              <Text style={styles.ecgTitle}>REALTIME_ECG_HR</Text>
              <Text style={styles.ecgSub}>{child?.name || 'Emma T.'} Vitals Stream</Text>
            </View>
            <View style={styles.bpmRow}>
              <Text style={styles.bpmNumber}>{reading?.heartRate || 72}</Text>
              <Text style={styles.bpmUnit}>BPM</Text>
            </View>
          </View>

          {/* ECG Wave Line Graphic */}
          <View style={styles.graphBox}>
            <View style={styles.graphWaveLine} />
          </View>
        </View>

        {/* Side-by-Side Vitals Row matching Figma */}
        <View style={styles.sideBySideRow}>
          <View style={styles.sideCard}>
            <Text style={styles.cardLabel}>GALVANIC_SKIN</Text>
            <Text style={styles.cardVal}>{reading?.gsr || 4.2} μS</Text>
            <View style={styles.pillNormal}>
              <Text style={styles.pillNormalText}>{t('normal')}</Text>
            </View>
          </View>

          <View style={styles.sideCard}>
            <Text style={styles.cardLabel}>RESPIRATION</Text>
            <Text style={styles.cardVal}>{reading?.respiration || 16} br/min</Text>
            <View style={styles.pillNormal}>
              <Text style={styles.pillNormalText}>{t('normal')}</Text>
            </View>
          </View>
        </View>

        {/* Motion State Card matching Figma */}
        <View style={styles.motionCard}>
          <View>
            <Text style={styles.motionLabel}>BODY_MOTION</Text>
            <Text style={styles.motionVal}>
              {language === 'bn' ? 'শান্ত — উপবিষ্ট' : 'Calm — Seated'}
            </Text>
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16 },
  liveStreamBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveStreamBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  ecgCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ecgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ecgTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  ecgSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bpmNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
  },
  bpmUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    marginLeft: 4,
  },
  graphBox: {
    height: 60,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  graphWaveLine: {
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
    width: '100%',
  },
  sideBySideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  sideCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
  },
  cardVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  pillNormal: {
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 10,
  },
  pillNormalText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  motionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  motionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
  },
  motionVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  liveBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
});
