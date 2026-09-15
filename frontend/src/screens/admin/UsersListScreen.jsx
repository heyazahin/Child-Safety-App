import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import TopHeader from '../../components/TopHeader';
import { getAllUsers } from '../../services/api';
import { COLORS } from '../../theme';

export default function UsersListScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error);
  }, []);

  const getInitials = (name, email) => {
    const target = name || email || 'User';
    return target.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.screen}>
      <TopHeader title="USERS DIRECTORY" subtitle="Guardians & Administrators" />

      <FlatList
        contentContainerStyle={styles.container}
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(item.name, item.email)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.userName}>{(item.name || item.email.split('@')[0]).toUpperCase()}</Text>
              <Text style={styles.userEmail}>{item.email} {item.phone ? `· ${item.phone}` : ''}</Text>
            </View>
            <View style={[styles.roleBadge, item.role === 'admin' ? styles.adminBadge : styles.guardianBadge]}>
              <Text style={[styles.roleText, item.role === 'admin' ? styles.adminRoleText : styles.guardianRoleText]}>
                {item.role?.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      />
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
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: COLORS.cardHeader,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: COLORS.mint,
    fontSize: 9,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  userName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontFamily: COLORS.fontMono,
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  guardianBadge: {
    backgroundColor: COLORS.mintBg,
    borderColor: COLORS.mint,
  },
  adminBadge: {
    backgroundColor: COLORS.distressBg,
    borderColor: COLORS.distress,
  },
  roleText: {
    fontFamily: COLORS.fontMono,
    fontSize: 8,
    fontWeight: '700',
  },
  guardianRoleText: {
    color: COLORS.mint,
  },
  adminRoleText: {
    color: COLORS.distress,
  },
});
