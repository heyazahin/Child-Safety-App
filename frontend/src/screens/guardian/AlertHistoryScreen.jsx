import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import TopHeader from '../../components/TopHeader';
import AlertCard from '../../components/AlertCard';
import { getAlertHistory, acknowledgeAlert } from '../../services/api';
import { COLORS } from '../../theme';
import { LanguageContext } from '../../context/LanguageContext';

export default function AlertHistoryScreen() {
  const { t, language } = useContext(LanguageContext);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All', 'Unread', 'Critical'
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setRefreshing(true);
      const data = await getAlertHistory();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
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
      Alert.alert(t('acknowledged'), language === 'bn' ? 'সংকেতটি গ্রহণ করা হয়েছে।' : 'Alert acknowledged.');
      fetchAlerts();
    } catch (error) {
      Alert.alert('Error', language === 'bn' ? 'ত্রুটি ঘটেছে।' : 'Failed to acknowledge alert');
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'Unread') return !a.acknowledgedAt;
    if (filter === 'Critical') return a.severity === 'high';
    return true;
  });

  return (
    <View style={styles.screen}>
      <TopHeader
        title={t('tabAlerts')}
        subtitle={language === 'bn' ? 'জরুরি সংকেত হিস্ট্রি' : 'Monitor and acknowledge vital anomalies'}
      />

      <View style={styles.container}>
        {/* Filter Chips matching Figma alert-history frame */}
        <View style={styles.chipRow}>
          {['All', 'Unread', 'Critical'].map(item => {
            const isSelected = filter === item;
            const label = language === 'bn' 
              ? (item === 'All' ? 'সবগুলো' : (item === 'Unread' ? 'নতুন' : 'জরুরি'))
              : item;

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
            <AlertCard alert={item} onAcknowledge={handleAcknowledge} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} tintColor={COLORS.mint} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {language === 'bn' ? 'কোন জরুরি সংকেত নেই' : 'NO ALERTS LOGGED IN SYSTEM'}
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 16 },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chipBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipBtnSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 14,
    fontWeight: '600',
  },
});
