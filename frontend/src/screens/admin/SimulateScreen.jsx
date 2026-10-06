import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList } from 'react-native';
import TopHeader from '../../components/TopHeader';
import { getAllChildren, simulateDistress, simulatePanic, simulateTamper } from '../../services/api';
import { COLORS } from '../../theme';

export default function SimulateScreen() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [heartRate, setHeartRate] = useState('135');
  const [gsr, setGsr] = useState('0.85');
  const [respiration, setRespiration] = useState('28');
  const [motionLevel, setMotionLevel] = useState('high');
  const [lastResult, setLastResult] = useState(null);

  const fetchChildren = async () => {
    try {
      const data = await getAllChildren();
      setChildren(data);
      if (data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSimulateTypeA = async () => {
    if (!selectedChild) {
      Alert.alert('Error', 'No child selected');
      return;
    }
    try {
      const values = { heartRate: Number(heartRate), gsr: Number(gsr), respiration: Number(respiration), motionLevel };
      const res = await simulateDistress(selectedChild._id, values);
      setLastResult({ ...res, label: 'DISTRESS ALERT FIRED' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Simulation failed');
    }
  };

  const handleSimulateTypeB = async () => {
    if (!selectedChild) {
      Alert.alert('Error', 'No child selected');
      return;
    }
    try {
      const res = await simulatePanic(selectedChild._id);
      setLastResult({ ...res, distressDetected: true, label: 'PANIC BUTTON ALERT FIRED' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Simulation failed');
    }
  };

  const handleSimulateTypeC = async () => {
    if (!selectedChild) {
      Alert.alert('Error', 'No child selected');
      return;
    }
    try {
      const res = await simulateTamper(selectedChild._id);
      setLastResult({ ...res, distressDetected: true, label: 'TAMPER WARNING FIRED' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Simulation failed');
    }
  };

  return (
    <View style={styles.screen}>
      <TopHeader title="SIMULATE READING" subtitle="Test emergency alert pipeline" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionHeader}>SELECT CHILD TARGET</Text>
        <TouchableOpacity style={styles.dropdownCard} onPress={() => setPickerVisible(true)}>
          <Text style={styles.dropdownText}>
            {selectedChild ? `${selectedChild.name.toUpperCase()} (CODE: ${selectedChild.childCode || '----'})` : 'SELECT A CHILD...'}
          </Text>
          <Text style={styles.chevronIcon}>▾</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>TELEMETRY INPUT VALUES (FOR TYPE A)</Text>

        <View style={styles.inputRowCard}>
          <Text style={styles.inputLabel}>HEART RATE (BPM)</Text>
          <TextInput style={styles.valueInput} value={heartRate} onChangeText={setHeartRate} keyboardType="numeric" />
        </View>

        <View style={styles.inputRowCard}>
          <Text style={styles.inputLabel}>GSR (μS)</Text>
          <TextInput style={styles.valueInput} value={gsr} onChangeText={setGsr} keyboardType="numeric" />
        </View>

        <View style={styles.inputRowCard}>
          <Text style={styles.inputLabel}>RESPIRATION (BPM)</Text>
          <TextInput style={styles.valueInput} value={respiration} onChangeText={setRespiration} keyboardType="numeric" />
        </View>

        <View style={styles.inputRowCard}>
          <Text style={styles.inputLabel}>MOTION LEVEL (LOW/MEDIUM/HIGH)</Text>
          <TextInput style={styles.valueInput} value={motionLevel} onChangeText={setMotionLevel} autoCapitalize="none" />
        </View>

        <Text style={styles.sectionHeader}>TEST ALERT TRIGGER SIMULATORS</Text>

        {/* Simulator Button 1: Distress */}
        <TouchableOpacity style={styles.redDistressBtn} onPress={handleSimulateTypeA}>
          <Text style={styles.btnText}>⚠️ SIMULATE DISTRESS ALERT</Text>
        </TouchableOpacity>

        {/* Simulator Button 2: Panic */}
        <TouchableOpacity style={[styles.redDistressBtn, { backgroundColor: '#EF4444', marginTop: 8 }]} onPress={handleSimulateTypeB}>
          <Text style={styles.btnText}>🆘 SIMULATE PANIC BUTTON</Text>
        </TouchableOpacity>

        {/* Simulator Button 3: Tamper */}
        <TouchableOpacity style={[styles.redDistressBtn, { backgroundColor: '#F59E0B', marginTop: 8 }]} onPress={handleSimulateTypeC}>
          <Text style={styles.btnText}>⚡ SIMULATE TAMPER WARNING</Text>
        </TouchableOpacity>

        {/* Result Card after simulation */}
        {lastResult && (
          <View style={[
            styles.resultCard,
            { backgroundColor: COLORS.distressBg, borderColor: COLORS.distress }
          ]}>
            <Text style={styles.resultCheckIcon}>✅</Text>
            <Text style={[styles.resultText, { color: COLORS.distress }]}>
              {lastResult.label || 'SIMULATED ALERT FIRED SUCCESSFULLY'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Child Selection Modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SELECT CHILD PROFILE</Text>
            
            <FlatList
              data={children}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.childOption}
                  onPress={() => {
                    setSelectedChild(item);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.childOptionName}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.childOptionCode}>CODE: {item.childCode}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.closeBtn} onPress={() => setPickerVisible(false)}>
              <Text style={styles.closeBtnText}>CANCEL</Text>
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
  sectionHeader: {
    fontFamily: COLORS.fontMono,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  dropdownCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dropdownText: {
    fontFamily: COLORS.fontMono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chevronIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  inputRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  inputLabel: {
    fontFamily: COLORS.fontMono,
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  valueInput: {
    fontFamily: COLORS.fontMono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.mint,
    textAlign: 'right',
    minWidth: 60,
  },
  redDistressBtn: {
    backgroundColor: COLORS.distress,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    color: '#FFFFFF',
    fontFamily: COLORS.fontMono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  resultCheckIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  resultText: {
    fontFamily: COLORS.fontMono,
    fontSize: 9,
    fontWeight: '700',
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
    maxHeight: '60%',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontFamily: COLORS.fontMono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  childOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childOptionName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  childOptionCode: {
    fontFamily: COLORS.fontMono,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  closeBtn: {
    marginTop: 16,
    padding: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.mint,
    fontFamily: COLORS.fontMono,
    fontWeight: '700',
    fontSize: 10,
  },
});
