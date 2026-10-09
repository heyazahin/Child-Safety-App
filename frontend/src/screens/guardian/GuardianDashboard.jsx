import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, Vibration } from 'react-native';
import TopHeader from '../../components/TopHeader';
import StatusCard from '../../components/StatusCard';
import VitalsTrend from '../../components/VitalsTrend';
import { getMyChild, getReadingHistory } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { COLORS } from '../../theme';

export default function GuardianDashboard() {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);

  const [child, setChild] = useState(null);
  const [reading, setReading] = useState(null);
  const [readings, setReadings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setLoadError('');
      const childData = await getMyChild();
      const history = await getReadingHistory(childData._id);
      setChild(childData);
      setReadings(history);
      setReading(history[history.length - 1] || null);
      if (['distress', 'tamper', 'alert'].includes(childData.currentStatus?.toLowerCase())) {
        Vibration.vibrate([0, 500, 200, 500]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setChild(null);
      setReading(null);
      setReadings([]);
      setLoadError(error.response?.data?.error || error.message || 'Could not load child readings.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isDistress = child?.currentStatus?.toLowerCase() === 'distress';
  const greeting = language === 'bn' ? 'শুভ দিন,' : 'Good morning,';

  return (
    <View style={styles.screen}>
      <TopHeader
        title={`${greeting} ${user?.name || 'Sarah Thompson'}`}
        subtitle={language === 'bn' ? 'শিশুর সেন্সর রিডিং' : 'Child sensor readings'}
        isDistress={isDistress}
        rightElement={
          <TouchableOpacity style={styles.alertIconBtn} onPress={fetchData}>
            <Text style={{ fontSize: 16 }}>ⓘ</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={COLORS.mint} />}
      >
        {!!loadError && <Text style={styles.errorText}>{loadError}</Text>}
        {child ? (
          <StatusCard
            childName={child.name}
            childAge={child.age}
            status={child.currentStatus}
            lastUpdated={reading?.timestamp || child.lastReadingAt}
          />
        ) : (
          <Text style={styles.emptyText}>
            {language === 'bn' ? 'আপনার অ্যাকাউন্টে কোনো শিশু লিংক করা নেই।' : 'No child is linked to your account.'}
          </Text>
        )}

        <Text style={styles.sectionHeader}>
          {language === 'bn' ? 'স্বাস্থ্য সেন্সর' : 'VITAL SENSORS'}
        </Text>

        {/* 4 Cards Grid Matching Figma */}
        <View style={styles.grid}>
          {/* Card 1: Heart Rate */}
          <View style={styles.sensorCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sensorTitle}>
                {language === 'bn' ? 'হৃদস্পন্দন' : 'HEART_RATE'}
              </Text>
              <Text style={styles.sensorIcon}>❤️</Text>
            </View>
            <View style={styles.valRow}>
              <Text style={styles.valNumber}>{reading?.heartRate ?? '—'}</Text>
              <Text style={styles.valUnit}> bpm</Text>
            </View>
            <View style={styles.sparklineBox}>
              <VitalsTrend
                readings={readings}
                field="heartRate"
                height={24}
                emptyLabel={language === 'bn' ? 'কোনো রিডিং নেই' : 'No readings'}
              />
            </View>
          </View>

          {/* Card 2: GSR Stress */}
          <View style={styles.sensorCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sensorTitle}>
                {language === 'bn' ? 'মানসিক চাপ' : 'GSR_STRESS'}
              </Text>
              <Text style={styles.sensorIcon}>💧</Text>
            </View>
            <View style={styles.valRow}>
              <Text style={styles.valNumber}>{reading?.gsr ?? '—'}</Text>
              <Text style={styles.valUnit}> μS</Text>
            </View>
            <VitalsTrend
              readings={readings}
              field="gsr"
              height={24}
              emptyLabel={language === 'bn' ? 'কোনো রিডিং নেই' : 'No readings'}
            />
          </View>

          {/* Card 3: Respiration */}
          <View style={styles.sensorCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sensorTitle}>
                {language === 'bn' ? 'শ্বাসপ্রশ্বাস' : 'RESPIRATION'}
              </Text>
              <Text style={styles.sensorIcon}>🫁</Text>
            </View>
            <View style={styles.valRow}>
              <Text style={styles.valNumber}>{reading?.respiration ?? '—'}</Text>
              <Text style={styles.valUnit}> br/min</Text>
            </View>
            <VitalsTrend
              readings={readings}
              field="respiration"
              height={24}
              emptyLabel={language === 'bn' ? 'কোনো রিডিং নেই' : 'No readings'}
            />
          </View>

          {/* Card 4: Body Motion */}
          <View style={styles.sensorCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sensorTitle}>
                {language === 'bn' ? 'চলাচল' : 'BODY_MOTION'}
              </Text>
              <Text style={styles.sensorIcon}>📈</Text>
            </View>
            <View style={styles.valRow}>
              <Text style={styles.valNumber}>
                {reading?.motionLevel ? t(reading.motionLevel) : '—'}
              </Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>
                {reading?.timestamp ? new Date(reading.timestamp).toLocaleTimeString() : 'No sensor data'}
              </Text>
            </View>
          </View>
        </View>

        {/* My Location Card */}
        {user?.homeLocation?.lat && user?.homeLocation?.lng && (
          <>
            <Text style={styles.sectionHeader}>
              {t('regMyLocation')}
            </Text>
            <View style={styles.locationCard}>
              <Image
                source={{ uri: `https://staticmap.thisistim.dev/?center=${user.homeLocation.lat},${user.homeLocation.lng}&zoom=14&size=600x120&markers=${user.homeLocation.lat},${user.homeLocation.lng}` }}
                style={styles.locationMapImg}
                resizeMode="cover"
              />
              <View style={styles.locationInfoRow}>
                <Text style={styles.locationCoords}>
                  📍 {user.homeAddress || (language === 'bn' ? 'ঠিকানার নাম পাওয়া যায়নি' : 'Location name unavailable')}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Sync Button */}
        <TouchableOpacity style={styles.syncBtn} onPress={fetchData}>
          <Text style={styles.syncBtnText}>🔄 {t('refreshBtn')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16 },
  alertIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardHeader,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  sensorIcon: {
    fontSize: 14,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  valNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  valUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sparklineBox: {
    minHeight: 24,
    marginTop: 8,
  },
  pillBadge: {
    backgroundColor: COLORS.mintBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  pillBadgeText: {
    color: COLORS.mint,
    fontSize: 11,
    fontWeight: '700',
  },
  syncBtn: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.mint,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  syncBtnText: {
    color: COLORS.mint,
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: COLORS.distress,
    fontSize: 12,
    marginVertical: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginVertical: 12,
  },
  locationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: COLORS.border,
    borderWidth: 1,
    backgroundColor: COLORS.card,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  locationMapImg: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.cardHeader,
  },
  locationInfoRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationCoords: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
