import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TopHeader from '../../components/TopHeader';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, GLOBAL_STYLES } from '../../theme';

export default function AdminSettingsScreen() {
  const { user, logout } = useContext(AuthContext);

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.screen}>
      <TopHeader title="ADMIN SETTINGS" subtitle="Operations Control Panel" />

      <View style={styles.container}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{getInitials(user?.name || 'Admin')}</Text>
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.userName}>{(user?.name || 'System Administrator').toUpperCase()}</Text>
            <Text style={styles.userEmail}>{user?.email || 'admin@project.com'}</Text>
            <Text style={styles.roleBadge}>ROLE: ADMIN</Text>
          </View>
        </View>

        <TouchableOpacity style={[GLOBAL_STYLES.buttonOutlined, styles.signOutBtn]} onPress={logout}>
          <Text style={GLOBAL_STYLES.buttonOutlinedText}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16 },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: COLORS.distressBg,
    borderColor: COLORS.distress,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.distress,
    fontSize: 12,
    fontWeight: '700',
  },
  profileTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontFamily: COLORS.fontMono,
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    fontFamily: COLORS.fontMono,
    marginTop: 6,
    color: COLORS.distress,
    fontWeight: '700',
    fontSize: 8,
  },
  signOutBtn: {
    marginTop: 12,
  },
});
