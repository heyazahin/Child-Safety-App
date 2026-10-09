import React, { useContext, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { COLORS } from '../theme';

const ALERT_POLL_INTERVAL_MS = 5000;

export default function GuardianAlertBanner() {
  const { token, role } = useContext(AuthContext);
  const [alert, setAlert] = useState(null);
  const seenAlertIds = useRef(new Set());
  const hasLoadedInitialAlerts = useRef(false);
  const requestInProgress = useRef(false);
  const audioContext = useRef(null);
  const activeAlarmRef = useRef(null);
  const alarmPlayer = useAudioPlayer(
    Platform.OS === 'web' ? null : require('../../assets/guardian-alarm.wav')
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    }).catch(error => {
      console.error('Could not enable guardian alert audio:', error);
    });
  }, []);

  const unlockAlertSound = () => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      if (!audioContext.current) audioContext.current = new AudioContextClass();
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume().catch(error => {
          console.warn('Browser did not allow alert audio to start:', error);
        });
      }
    } catch (error) {
      console.warn('Could not prepare guardian alert audio:', error);
    }
  };

  const playAlertSound = () => {
    const context = audioContext.current;
    if (!context) {
      unlockAlertSound();
      return;
    }
    if (context.state !== 'running') {
      context.resume().catch(error => {
        console.warn('Browser did not allow alert audio to start:', error);
      });
      return;
    }

    const startAt = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(760, startAt);
    oscillator.frequency.linearRampToValueAtTime(1180, startAt + 0.45);
    oscillator.frequency.linearRampToValueAtTime(760, startAt + 0.9);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.85, startAt + 0.04);
    gain.gain.setValueAtTime(0.85, startAt + 0.78);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.95);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.96);
  };

  const stopAlarm = () => {
    if (activeAlarmRef.current) {
      clearInterval(activeAlarmRef.current.soundInterval);
      clearInterval(activeAlarmRef.current.vibrationInterval);
      activeAlarmRef.current = null;
    }
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(0);
    } else if (Platform.OS !== 'web') {
      Vibration.cancel();
      alarmPlayer.pause();
      alarmPlayer.seekTo(0).catch(error => {
        console.warn('Could not reset guardian alert audio:', error);
      });
    }
  };

  const startAlarm = () => {
    stopAlarm();
    if (Platform.OS !== 'web') {
      alarmPlayer.loop = true;
      alarmPlayer.play();
      Vibration.vibrate([0, 1000, 200, 1000, 200]);
      const vibrationInterval = setInterval(() => {
        Vibration.vibrate([0, 1000, 200, 1000, 200]);
      }, 2600);
      activeAlarmRef.current = { soundInterval: null, vibrationInterval };
      return;
    }

    playAlertSound();
    const soundInterval = setInterval(playAlertSound, 1200);

    let vibrationInterval = null;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([0, 1000, 200, 1000, 200]);
      vibrationInterval = setInterval(() => {
        navigator.vibrate([0, 1000, 200, 1000, 200]);
      }, 2600);
    }

    activeAlarmRef.current = { soundInterval, vibrationInterval };
  };

  useEffect(() => {
    setAlert(null);
    seenAlertIds.current = new Set();
    hasLoadedInitialAlerts.current = false;

    if (!token || role !== 'guardian') return undefined;

    let isActive = true;
    if (Platform.OS === 'web') {
      document.addEventListener('pointerdown', unlockAlertSound, { passive: true });
      document.addEventListener('keydown', unlockAlertSound);
    }
    const checkForNewAlerts = async () => {
      if (requestInProgress.current) return;
      requestInProgress.current = true;

      try {
        const response = await api.get('/data/alerts', { params: { recent: true } });
        if (!isActive) return;
        const alerts = Array.isArray(response.data) ? response.data : [];

        if (!hasLoadedInitialAlerts.current) {
          alerts.forEach(item => seenAlertIds.current.add(item._id));
          hasLoadedInitialAlerts.current = true;
          return;
        }

        const newAlerts = alerts.filter(item => !seenAlertIds.current.has(item._id));
        alerts.forEach(item => seenAlertIds.current.add(item._id));

        if (newAlerts.length) {
          const newestAlert = newAlerts[0];
          setAlert(newestAlert);
          startAlarm();
        }
      } catch (error) {
        if (isActive) console.error('Failed to check for guardian alerts:', error);
      } finally {
        requestInProgress.current = false;
      }
    };

    checkForNewAlerts();
    const interval = setInterval(checkForNewAlerts, ALERT_POLL_INTERVAL_MS);
    return () => {
      isActive = false;
      clearInterval(interval);
      if (Platform.OS === 'web') {
        document.removeEventListener('pointerdown', unlockAlertSound);
        document.removeEventListener('keydown', unlockAlertSound);
      }
      stopAlarm();
    };
  }, [token, role]);

  if (!token || role !== 'guardian') return null;

  const childName = alert?.childId?.name || 'your child';
  const alertType = (alert?.alertType || 'safety').toUpperCase();

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {alert && (
        <View style={styles.bannerContainer} accessibilityLiveRegion="assertive">
          <View style={styles.banner} accessibilityRole="alert">
            <View style={styles.copy}>
              <Text style={styles.title}>New child safety alert</Text>
              <Text style={styles.message}>
                {alertType} alert for {childName}. Open Alert History to review.
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Dismiss new alert"
              onPress={() => {
                stopAlarm();
                setAlert(null);
              }}
              style={styles.dismissButton}
            >
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 12 : 48,
    left: 12,
    right: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.distressBg,
    borderColor: COLORS.distress,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: COLORS.distress,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  dismissButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dismissText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
