import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import * as Location from 'expo-location';
import TopHeader from '../../components/TopHeader';
import StatusCard from '../../components/StatusCard';
import { getMyChild, getLatestReading } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { COLORS } from '../../theme';

export default function GuardianDashboard() {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);

  const [child, setChild] = useState(null);
  const [reading, setReading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const childData = await getMyChild();
      setChild(childData);
      if (childData && childData._id) {
        const readingData = await getLatestReading(childData._id);
        setReading(readingData.latestReading);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        subtitle={language === 'bn' ? 'শিশুর শারীরিক লাইভ তথ্য' : 'Child telemetry active'}
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
        {/* Child Profile Banner matching Figma */}
        <StatusCard
          childName={child?.name || 'Emma T.'}
          childAge={child?.age || 8}
          status={child?.currentStatus || 'safe'}
          lastUpdated={child?.lastReadingAt}
        />

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
              <Text style={styles.valNumber}>{reading?.heartRate || 72}</Text>
              <Text style={styles.valUnit}> bpm</Text>
            </View>
            {/* Sparkline Wave Mock */}
            <View style={styles.sparklineBox}>
              <View style={styles.sparklineWave} />
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
              <Text style={styles.valNumber}>{reading?.gsr || 4.2}</Text>
              <Text style={styles.valUnit}> μS</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>• {t('normal')}</Text>
            </View>
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
              <Text style={styles.valNumber}>{reading?.respiration || 16}</Text>
              <Text style={styles.valUnit}> br/min</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>• {t('normal')}</Text>
            </View>
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
              <Text style={styles.valNumber}>{t('calm')}</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>• {language === 'bn' ? 'স্থির' : 'Seated'}</Text>
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
                  📍 {user.homeLocation.lat.toFixed(4)}, {user.homeLocation.lng.toFixed(4)}
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
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16 },
  alertIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
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
    color: '#6B7280',
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
    color: '#111827',
  },
  valUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  sparklineBox: {
    height: 16,
    justifyContent: 'center',
    marginTop: 8,
  },
  sparklineWave: {
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 2,
    width: '100%',
  },
  pillBadge: {
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  pillBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  syncBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
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
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
  },
  locationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E2E8F0',
  },
  locationInfoRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationCoords: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
});
