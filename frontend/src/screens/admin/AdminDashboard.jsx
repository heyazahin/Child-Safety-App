import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import TopHeader from '../../components/TopHeader';
import AlertCard from '../../components/AlertCard';
import { getAllChildren, getAllUsers, getAllAlerts } from '../../services/api';
import { COLORS } from '../../theme';

export default function AdminDashboard({ navigation }) {
  const [childrenCount, setChildrenCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminStats = async () => {
    try {
      setRefreshing(true);
      const children = await getAllChildren();
      const users = await getAllUsers();
      const alerts = await getAllAlerts();

      setChildrenCount(children.length);
      setUsersCount(users.length);
      setAlertsCount(alerts.length);
      setRecentAlerts(alerts.slice(0, 3));
    } catch (error) {
      console.error('Error fetching admin overview:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <View style={styles.screen}>
      <TopHeader
        title="ADMIN CONSOLE"
        subtitle="Operations System Overview"
        rightElement={<Text style={{ fontSize: 14 }}>🛡️</Text>}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAdminStats} tintColor={COLORS.mint} />}
      >
        {/* 2x2 stat cards */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.mint }]}>{childrenCount}</Text>
            <Text style={styles.statLabel}>CHILDREN</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.mint }]}>{usersCount}</Text>
            <Text style={styles.statLabel}>GUARDIANS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.distress }]}>{alertsCount}</Text>
            <Text style={styles.statLabel}>ACTIVE ALERTS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.mint, fontSize: 13 }]}>ONLINE</Text>
            <Text style={styles.statLabel}>SYSTEM STATUS</Text>
          </View>
        </View>

        {/* Recent alerts section with View all link */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RECENT INCIDENT ALERTS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {recentAlerts.map((item) => (
          <AlertCard key={item._id} alert={item} showGuardianName />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: COLORS.fontMono,
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: COLORS.fontMono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  viewAllText: {
    fontFamily: COLORS.fontMono,
    fontSize: 9,
    color: COLORS.mint,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
