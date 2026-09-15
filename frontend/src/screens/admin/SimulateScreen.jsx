import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList } from 'react-native';
import TopHeader from '../../components/TopHeader';
import { getAllChildren, simulateDistress } from '../../services/api';
import { COLORS } from '../../theme';

export default function SimulateScreen() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [heartRate, setHeartRate] = useState('135');
  const [gsr, setGsr] = useState('0.85');
  const [respiration, setRespiration] = useState('28');
  const [motionLevel, setMotionLevel] = useState('low');
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

  const handleSimulate = async (isDistress) => {
    if (!selectedChild) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    const values = isDistress
      ? { heartRate: Number(heartRate), gsr: Number(gsr), respiration: Number(respiration), motionLevel }
      : { heartRate: 75, gsr: 0.35, respiration: 16, motionLevel: 'medium' };

    try {
      const res = await simulateDistress(selectedChild._id, values);
      setLastResult(res);
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

        <Text style={styles.sectionHeader}>TELEMETRY INPUT VALUES</Text>

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

        {/* Full red (#EF4444) button */}
        <TouchableOpacity style={styles.redDistressBtn} onPress={() => handleSimulate(true)}>
          <Text style={styles.btnText}>SIMULATE DISTRESS</Text>
        </TouchableOpacity>

        {/* Outlined teal button */}
        <TouchableOpacity style={styles.outlinedTealBtn} onPress={() => handleSimulate(false)}>
          <Text style={styles.tealBtnText}>SIMULATE NORMAL</Text>
        </TouchableOpacity>

        {/* Result Card after simulation */}
        {lastResult && (
          <View style={[
            styles.resultCard,
            { backgroundColor: lastResult.distressDetected ? COLORS.distressBg : COLORS.mintBg,
              borderColor: lastResult.distressDetected ? COLORS.distress : COLORS.mint }
          ]}>
            <Text style={styles.resultCheckIcon}>
              {lastResult.distressDetected ? '⚠️' : '✅'}
            </Text>
            <Text style={[
              styles.resultText,
              { color: lastResult.distressDetected ? COLORS.distress : COLORS.mint }
            ]}>
              {lastResult.distressDetected 
                ? 'DISTRESS DETECTED · DISPATCH FIRED TO GUARDIAN' 
                : 'NORMAL READING · CHILD STATE REMAINS SAFE'}
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
    marginTop: 16,
  },
  btnText: {
    color: '#0B132B',
    fontFamily: COLORS.fontMono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  outlinedTealBtn: {
    borderColor: COLORS.mint,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  tealBtnText: {
    color: COLORS.mint,
    fontFamily: COLORS.fontMono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
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
