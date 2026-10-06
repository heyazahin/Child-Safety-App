import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import TopHeader from '../../components/TopHeader';
import AlertCard from '../../components/AlertCard';
import { getAllAlerts, acknowledgeAlert } from '../../services/api';
import { COLORS } from '../../theme';
import { LanguageContext } from '../../context/LanguageContext';

export default function AllAlertsScreen() {
  const { t, language } = useContext(LanguageContext);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All', 'Distress', 'Panic', 'Tamper'
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setRefreshing(true);
      const data = await getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching all alerts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = alerts.filter(a => !a.acknowledgedAt).length;

  // Panic alerts always sorted at top
  const sortedAlerts = [...alerts].sort((a, b) => {
    const typeA = a.alertType || 'distress';
    const typeB = b.alertType || 'distress';
    const aIsPanic = typeA === 'panic' || typeA === 'typeB';
    const bIsPanic = typeB === 'panic' || typeB === 'typeB';
    if (aIsPanic && !bIsPanic) return -1;
    if (!aIsPanic && bIsPanic) return 1;
    return new Date(b.triggeredAt || 0) - new Date(a.triggeredAt || 0);
  });

  const filteredAlerts = sortedAlerts.filter(a => {
    const type = a.alertType || 'distress';
    if (filter === 'Distress') return type === 'distress' || type === 'typeA';
    if (filter === 'Panic') return type === 'panic' || type === 'typeB';
    if (filter === 'Tamper') return type === 'tamper' || type === 'typeC';
    return true;
  });

  return (
    <View style={styles.screen}>
      <TopHeader
        title="ALL SYSTEM ALERTS"
        subtitle="Global distress logs"
        badge={
          unreadCount > 0 ? (
            <View style={styles.amberBadge}>
              <Text style={styles.amberBadgeText}>{unreadCount} UNREAD</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.container}>
        {/* Filter Buttons: All / Distress / Panic / Tamper */}
        <View style={styles.chipRow}>
          {['All', 'Distress', 'Panic', 'Tamper'].map(item => {
            const isSelected = filter === item;
            let label = item;
            if (language === 'bn') {
              if (item === 'All') label = 'সবগুলো';
              else if (item === 'Distress') label = 'বিপদ (Distress)';
              else if (item === 'Panic') label = 'প্যানিক (Panic)';
              else if (item === 'Tamper') label = 'টেম্পার (Tamper)';
            }

            return (
              <TouchableOpacity
                key={item}
                style={[styles.chipBtn, isSelected && styles.chipBtnSelected]}
                onPress={() => setFilter(item)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AlertCard alert={item} onAcknowledge={handleAcknowledge} showGuardianName />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} tintColor={COLORS.mint} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>NO ALERTS LOGGED IN SYSTEM</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16 },
  amberBadge: {
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  amberBadgeText: {
    color: COLORS.amber,
    fontFamily: COLORS.fontMono,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chipBtn: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontFamily: COLORS.fontMono,
    marginTop: 40,
    fontSize: 10,
    letterSpacing: 1,
  },
});
