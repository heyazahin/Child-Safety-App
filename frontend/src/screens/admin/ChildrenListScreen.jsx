import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import TopHeader from '../../components/TopHeader';
import { getAllChildren, createChild } from '../../services/api';
import { COLORS, GLOBAL_STYLES } from '../../theme';

export default function ChildrenListScreen() {
  const [children, setChildren] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [school, setSchool] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchChildren = () => {
    getAllChildren().then(setChildren).catch(console.error);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleAddChild = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Validation Error', 'Please enter child name and age');
      return;
    }

    try {
      setLoading(true);
      await createChild(name, age, school);
      Alert.alert('Success', 'Child profile created successfully!');
      setName('');
      setAge('');
      setSchool('');
      setModalVisible(false);
      fetchChildren();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create child profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (childName) => {
    if (!childName) return 'C';
    return childName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderFooter = () => (
    <TouchableOpacity style={styles.dashedCard} onPress={() => setModalVisible(true)}>
      <View style={[styles.avatar, { backgroundColor: COLORS.border }]}>
        <Text style={{ fontSize: 12, color: COLORS.textMuted }}>＋</Text>
      </View>
      <Text style={styles.addText}>ADD CHILD PROFILE</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <TopHeader 
        title="CHILDREN DIRECTORY" 
        subtitle="Managed student profiles" 
        rightElement={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ color: '#fff', fontSize: 16 }}>＋</Text>
          </TouchableOpacity>
        } 
      />

      <FlatList
        contentContainerStyle={styles.container}
        data={children}
        keyExtractor={(item) => item._id}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => {
          const isDistress = item.currentStatus?.toLowerCase() === 'distress';
          return (
            <View style={styles.card}>
              <View style={[styles.avatar, { backgroundColor: isDistress ? COLORS.distress : COLORS.cardHeader, borderColor: isDistress ? COLORS.distress : COLORS.mint, borderWidth: 1 }]}>
                <Text style={[styles.avatarText, { color: isDistress ? '#fff' : COLORS.mint }]}>{getInitials(item.name)}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.childName}>{item.name}</Text>
                <Text style={styles.childMeta}>
                  AGE {item.age} · {item.school || 'School'} · CODE: {item.childCode || '----'}
                </Text>
              </View>

              <View style={[styles.statusDot, { backgroundColor: isDistress ? COLORS.distress : COLORS.mint }]} />
            </View>
          );
        }}
      />

      {/* Add Child Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CREATE CHILD PROFILE</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CHILD NAME</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Tommy Smith"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>AGE</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 8"
                placeholderTextColor={COLORS.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SCHOOL NAME</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Lincoln Elementary"
                placeholderTextColor={COLORS.textMuted}
                value={school}
                onChangeText={setSchool}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[GLOBAL_STYLES.buttonOutlined, { flex: 1, marginRight: 8 }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={GLOBAL_STYLES.buttonOutlinedText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[GLOBAL_STYLES.button, { flex: 1 }]} 
                onPress={handleAddChild}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#0B132B" size="small" /> : <Text style={GLOBAL_STYLES.buttonText}>SAVE PROFILE</Text>}
              </TouchableOpacity>
            </View>
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
  dashedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
  },
  childName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  childMeta: {
    fontFamily: COLORS.fontMono,
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addText: {
    fontFamily: COLORS.fontMono,
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontFamily: COLORS.fontMono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: COLORS.fontMono,
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
