import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import TopHeader from '../../components/TopHeader';
import AlertCard from '../../components/AlertCard';
import { getAllAlerts, acknowledgeAlert } from '../../services/api';
import { COLORS } from '../../theme';

export default function AllAlertsScreen() {
  const [alerts, setAlerts] = useState([]);
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
        <FlatList
          data={alerts}
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
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontFamily: COLORS.fontMono,
    marginTop: 40,
    fontSize: 10,
    letterSpacing: 1,
  },
});
