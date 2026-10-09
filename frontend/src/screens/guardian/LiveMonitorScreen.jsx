import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopHeader from '../../components/TopHeader';
import VitalsTrend from '../../components/VitalsTrend';
import { getMyChild, getReadingHistory } from '../../services/api';
import { COLORS } from '../../theme';
import { LanguageContext } from '../../context/LanguageContext';

export default function LiveMonitorScreen() {
  const { t, language } = useContext(LanguageContext);
  const [child, setChild] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loadError, setLoadError] = useState('');

  const fetchLiveReading = async () => {
    try {
      const childData = await getMyChild();
      setChild(childData);
      setReadings(await getReadingHistory(childData._id));
      setLoadError('');
    } catch (error) {
      console.error('Error polling live reading:', error);
      setLoadError(error.response?.data?.error || error.message || 'Could not load sensor readings.');
    }
  };

  useEffect(() => {
    fetchLiveReading();
    const interval = setInterval(fetchLiveReading, 5000);
    return () => clearInterval(interval);
  }, []);

  const isDistress = ['distress', 'tamper', 'alert'].includes(child?.currentStatus?.toLowerCase());
  const reading = readings[readings.length - 1] || null;

  return (
    <View style={styles.screen}>
      <TopHeader
        title={t('tabMonitor')}
        subtitle={language === 'bn' ? 'প্রতি ৫ সেকেন্ডে সেন্সর রিডিং আপডেট' : 'Sensor readings refresh every 5 seconds'}
        isDistress={isDistress}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {!!loadError && <Text style={styles.errorText}>{loadError}</Text>}
        {!child && !loadError && (
          <Text style={styles.emptyText}>
            {language === 'bn' ? 'আপনার অ্যাকাউন্টে কোনো শিশু লিংক করা নেই।' : 'No child is linked to your account.'}
          </Text>
        )}
        {child && readings.length === 0 && !loadError && (
          <Text style={styles.emptyText}>
            {language === 'bn' ? 'এখনও কোনো সেন্সর রিডিং পাওয়া যায়নি।' : 'No sensor readings have been received yet.'}
          </Text>
        )}

        <View style={styles.ecgCard}>
          <View style={styles.ecgHeader}>
            <View>
              <Text style={styles.ecgTitle}>HEART RATE HISTORY</Text>
              <Text style={styles.ecgSub}>{child?.name || '—'} · {readings.length} readings</Text>
            </View>
            <View style={styles.bpmRow}>
              <Text style={styles.bpmNumber}>{reading?.heartRate ?? '—'}</Text>
              <Text style={styles.bpmUnit}>BPM</Text>
            </View>
          </View>

          <VitalsTrend
            readings={readings}
            field="heartRate"
            height={80}
            emptyLabel={language === 'bn' ? 'কোনো রিডিং নেই' : 'No readings'}
          />
          <Text style={styles.updatedAt}>
            {reading?.timestamp
              ? `${language === 'bn' ? 'সর্বশেষ রিডিং:' : 'Latest reading:'} ${new Date(reading.timestamp).toLocaleString()}`
              : language === 'bn' ? 'সর্বশেষ রিডিং নেই' : 'No latest reading'}
          </Text>
        </View>

        <View style={styles.sideBySideRow}>
          <View style={styles.sideCard}>
            <Text style={styles.cardLabel}>GALVANIC_SKIN</Text>
            <Text style={styles.cardVal}>{reading?.gsr ?? '—'} μS</Text>
            <VitalsTrend
              readings={readings}
              field="gsr"
              height={64}
              emptyLabel={language === 'bn' ? 'কোনো রিডিং নেই' : 'No readings'}
            />
          </View>

          <View style={styles.sideCard}>
            <Text style={styles.cardLabel}>RESPIRATION</Text>
            <Text style={styles.cardVal}>{reading?.respiration ?? '—'} br/min</Text>
            <VitalsTrend
              readings={readings}
              field="respiration"
              height={64}
              emptyLabel={language === 'bn' ? 'কোনো রিডিং নেই' : 'No readings'}
            />
          </View>
        </View>

        <View style={styles.motionCard}>
          <View>
            <Text style={styles.motionLabel}>BODY_MOTION</Text>
            <Text style={styles.motionVal}>
              {reading?.motionLevel ? t(reading.motionLevel) : '—'}
            </Text>
          </View>
          <Text style={styles.updatedAt}>
            {reading?.timestamp ? new Date(reading.timestamp).toLocaleTimeString() : 'No data'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16 },
  errorText: { color: COLORS.distress, fontSize: 12, marginBottom: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 12 },
  ecgCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
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
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  ecgSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bpmNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  bpmUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  updatedAt: { color: COLORS.textMuted, fontSize: 10, marginTop: 8 },
  sideBySideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  sideCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
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
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  cardVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  motionCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
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
    color: COLORS.textSecondary,
  },
  motionVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
});
