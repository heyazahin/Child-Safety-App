import React, { useEffect, useState } from 'react';
import {
  FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import TopHeader from '../../components/TopHeader';
import { getAllUsers } from '../../services/api';
import { COLORS } from '../../theme';

export default function UsersListScreen() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(error => {
      console.error('Could not load user directory:', error);
    });
  }, []);

  const getInitials = (name, email) => {
    const target = name || email || 'User';
    return target.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderProfileField = (label, value) => (
    <View style={styles.profileField} key={label}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value || 'Not provided'}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopHeader title="USERS DIRECTORY" subtitle="Tap a guardian to view their profile" />

      <FlatList
        contentContainerStyle={styles.container}
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedUser(item)}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.role} profile for ${item.name || item.email}`}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(item.name, item.email)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.userName}>{(item.name || item.email.split('@')[0]).toUpperCase()}</Text>
              <Text style={styles.userEmail}>{item.email} {item.phone ? `· ${item.phone}` : ''}</Text>
              <Text style={styles.tapHint}>{item.role === 'guardian' ? 'View guardian profile' : 'View administrator profile'}</Text>
            </View>
            <View style={[styles.roleBadge, item.role === 'admin' ? styles.adminBadge : styles.guardianBadge]}>
              <Text style={[styles.roleText, item.role === 'admin' ? styles.adminRoleText : styles.guardianRoleText]}>
                {item.role?.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
      />

      <Modal
        visible={!!selectedUser}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{getInitials(selectedUser?.name, selectedUser?.email)}</Text>
              </View>
              <View style={styles.modalHeading}>
                <Text style={styles.modalTitle}>{selectedUser?.name || 'User profile'}</Text>
                <Text style={styles.modalSubtitle}>{selectedUser?.role?.toUpperCase()}</Text>
              </View>
            </View>

            <ScrollView>
              {renderProfileField('Email', selectedUser?.email)}
              {renderProfileField('Phone', selectedUser?.phone)}
              {selectedUser?.role === 'guardian' && (
                <>
                  {renderProfileField('Relationship to child', selectedUser?.relationship)}
                  {renderProfileField('Emergency contact', selectedUser?.emergencyContactName)}
                  {renderProfileField('Emergency contact phone', selectedUser?.emergencyContactPhone)}
                  {renderProfileField('Registered location', selectedUser?.homeAddress)}
                  {selectedUser?.homeLocation?.lat != null && selectedUser?.homeLocation?.lng != null &&
                    renderProfileField(
                      'Location coordinates',
                      `${selectedUser.homeLocation.lat}, ${selectedUser.homeLocation.lng}`
                    )}
                  {renderProfileField(
                    'Consent',
                    selectedUser?.consentGiven ? 'Given' : 'Not recorded'
                  )}
                  {renderProfileField(
                    'Consent date',
                    selectedUser?.consentGivenAt
                      ? new Date(selectedUser.consentGivenAt).toLocaleDateString()
                      : null
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedUser(null)}>
              <Text style={styles.closeButtonText}>Close profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardHeader,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: COLORS.mint, fontSize: 12, fontWeight: '700' },
  info: { flex: 1 },
  userName: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  userEmail: { fontFamily: COLORS.fontMono, fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  tapHint: { fontSize: 10, color: COLORS.mint, marginTop: 5, fontWeight: '600' },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  guardianBadge: { backgroundColor: COLORS.mintBg, borderColor: COLORS.mint },
  adminBadge: { backgroundColor: COLORS.distressBg, borderColor: COLORS.distress },
  roleText: { fontFamily: COLORS.fontMono, fontSize: 8, fontWeight: '700' },
  guardianRoleText: { color: COLORS.mint },
  adminRoleText: { color: COLORS.distress },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '85%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalHeading: { flex: 1 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  modalSubtitle: { color: COLORS.mint, fontSize: 11, fontWeight: '700', marginTop: 3 },
  profileField: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 10 },
  profileLabel: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: '700' },
  profileValue: { color: COLORS.textPrimary, fontSize: 14, marginTop: 3 },
  closeButton: {
    backgroundColor: COLORS.mint,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: { color: '#FFFFFF', fontWeight: '800' },
});
