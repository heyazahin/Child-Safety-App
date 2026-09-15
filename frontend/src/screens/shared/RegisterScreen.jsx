import React, { useState, useContext, useRef, useCallback, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Modal, Image, Linking
} from 'react-native';
import * as Location from 'expo-location';
import { registerUser } from '../../services/api';
import { COLORS } from '../../theme';
import { LanguageContext } from '../../context/LanguageContext';

// ── Replace with your actual Google Form URL ──
const CONSENT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeXCFuThdLOTfSBG_XMfg4DNxpO-yGk9qX5IbwG9my3HWlZ8w/viewform';

const TOTAL_STEPS = 4;

const RELATIONSHIP_OPTIONS = [
  { key: 'father',   en: 'Father',        bn: 'বাবা' },
  { key: 'mother',   en: 'Mother',        bn: 'মা' },
  { key: 'guardian', en: 'Legal Guardian', bn: 'আইনি অভিভাবক' },
  { key: 'teacher',  en: 'Teacher',       bn: 'শিক্ষক' },
  { key: 'other',    en: 'Other',         bn: 'অন্যান্য' },
];

// ═══════════════════════════════════════════
// FastInput — local state, syncs to parent only on blur
// Prevents full-screen re-render on every keystroke
// ═══════════════════════════════════════════
const FastInput = memo(({ label, hint, placeholder, defaultValue = '', onCommit,
  secureTextEntry, keyboardType, autoCapitalize, multiline, numberOfLines }) => {
  const [localValue, setLocalValue] = useState(defaultValue);

  const handleChange = useCallback((text) => {
    setLocalValue(text);
    onCommit(text); // sync ref every keystroke — refs don't re-render parent
  }, [onCommit]);

  return (
    <View style={fStyles.fieldCard}>
      <Text style={fStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[fStyles.input, multiline && fStyles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={localValue}
        onChangeText={handleChange}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {hint ? <Text style={fStyles.fieldHint}>{hint}</Text> : null}
    </View>
  );
});

const fStyles = StyleSheet.create({
  fieldCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldHint: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 6,
  },
  textArea: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
});

// ═══════════════════════════════════════════
// Main RegisterScreen
// ═══════════════════════════════════════════
export default function RegisterScreen({ navigation }) {
  const { t, language } = useContext(LanguageContext);
  const scrollRef = useRef(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1 — Guardian (refs hold committed values, no re-render per keystroke)
  const nameRef = useRef('');
  const emailRef = useRef('');
  const phoneRef = useRef('');
  const passwordRef = useRef('');
  const [relationship, setRelationship] = useState('guardian');
  const [showRelPicker, setShowRelPicker] = useState(false);

  // Step 2 — Child & Emergency
  const childCodeRef = useRef('');
  const medicalNotesRef = useRef('');
  const emergencyNameRef = useRef('');
  const emergencyPhoneRef = useRef('');

  // Step 3 — Location
  const [homeLocation, setHomeLocation] = useState(null);
  const homeAddressRef = useRef('');
  const [locLoading, setLocLoading] = useState(false);

  // Step 4 — Consent
  const [consentChecked, setConsentChecked] = useState(false);
  const [formOpened, setFormOpened] = useState(false);

  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  const goNext = useCallback(() => {
    setErrorMessage('');
    if (step === 1) {
      if (!nameRef.current.trim() || !emailRef.current.trim() || !passwordRef.current.trim()) {
        setErrorMessage(t('regRequiredFields'));
        return;
      }
    }
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      scrollToTop();
    }
  }, [step, t]);

  const goBack = useCallback(() => {
    if (step > 1) {
      setStep(s => s - 1);
      scrollToTop();
    }
  }, [step]);

  // GPS capture
  const captureLocation = useCallback(async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('', t('regLocationFailed'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setHomeLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (err) {
      Alert.alert('', t('regLocationFailed'));
    } finally {
      setLocLoading(false);
    }
  }, [t]);

  const openConsentForm = useCallback(() => {
    setFormOpened(true);
    Linking.openURL(CONSENT_FORM_URL).catch(() =>
      Alert.alert('Error', 'Could not open consent form link')
    );
  }, []);

  const handleRegister = useCallback(async () => {
    setErrorMessage('');
    if (!consentChecked) {
      setErrorMessage(t('regConsentRequired'));
      return;
    }
    if (!nameRef.current.trim() || !emailRef.current.trim() || !passwordRef.current.trim()) {
      setErrorMessage(t('regRequiredFields'));
      return;
    }
    try {
      setSubmitting(true);
      await registerUser({
        name: nameRef.current.trim(),
        email: emailRef.current.trim(),
        phone: phoneRef.current.trim(),
        password: passwordRef.current,
        role: 'guardian',
        relationship,
        emergencyContactName: emergencyNameRef.current.trim() || null,
        emergencyContactPhone: emergencyPhoneRef.current.trim() || null,
        homeAddress: homeAddressRef.current.trim() || null,
        homeLocation: homeLocation || { lat: null, lng: null },
        consentGiven: true,
      });
      // Redirect to login page immediately
      navigation.navigate('Login');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not register user');
    } finally {
      setSubmitting(false);
    }
  }, [consentChecked, relationship, homeLocation, language, t, navigation]);

  // ── Progress bar ──
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((s) => (
        <View key={s} style={styles.progressStepWrapper}>
          <View style={[
            styles.progressDot,
            s <= step && styles.progressDotActive,
            s < step && styles.progressDotDone,
          ]}>
            <Text style={[styles.progressDotText, s <= step && styles.progressDotTextActive]}>
              {s < step ? '✓' : s}
            </Text>
          </View>
          {s < 4 && (
            <View style={[styles.progressLine, s < step && styles.progressLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const stepTitleKey = ['regStep1Title', 'regStep2Title', 'regStep3Title', 'regStep4Title'];
  const stepSubKey  = ['regStep1Subtitle', 'regStep2Subtitle', 'regStep3Subtitle', 'regStep4Subtitle'];

  // ═══════════════════════════════════════════
  // STEP 1 — Guardian Details
  // ═══════════════════════════════════════════
  const renderStep1 = () => (
    <>
      <FastInput
        label={t('regFullName')}
        placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'John Doe'}
        defaultValue={nameRef.current}
        onCommit={v => { nameRef.current = v; }}
      />
      <FastInput
        label={t('email')}
        placeholder="email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        defaultValue={emailRef.current}
        onCommit={v => { emailRef.current = v; }}
      />
      <FastInput
        label={t('phone')}
        placeholder="+8801700000000"
        keyboardType="phone-pad"
        defaultValue={phoneRef.current}
        onCommit={v => { phoneRef.current = v; }}
      />
      <FastInput
        label={t('password')}
        placeholder="••••••••"
        secureTextEntry
        defaultValue={passwordRef.current}
        onCommit={v => { passwordRef.current = v; }}
      />

      {/* Relationship picker */}
      <View style={fStyles.fieldCard}>
        <Text style={fStyles.fieldLabel}>{t('regRelationship')}</Text>
        <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowRelPicker(true)}>
          <Text style={styles.pickerTriggerText}>
            {RELATIONSHIP_OPTIONS.find(r => r.key === relationship)?.[language] ||
              RELATIONSHIP_OPTIONS.find(r => r.key === relationship)?.en}
          </Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // ═══════════════════════════════════════════
  // STEP 2 — Child & Emergency Contact
  // ═══════════════════════════════════════════
  const renderStep2 = () => (
    <>
      <FastInput
        label={t('regChildCode')}
        hint={t('regChildCodeHint')}
        placeholder="BB83B5D6"
        autoCapitalize="characters"
        defaultValue={childCodeRef.current}
        onCommit={v => { childCodeRef.current = v; }}
      />
      <FastInput
        label={t('regEmergencyName')}
        hint={t('regEmergencyHint')}
        placeholder={language === 'bn' ? 'যোগাযোগ ব্যক্তির নাম' : 'Contact person name'}
        defaultValue={emergencyNameRef.current}
        onCommit={v => { emergencyNameRef.current = v; }}
      />
      <FastInput
        label={t('regEmergencyPhone')}
        placeholder="+8801800000000"
        keyboardType="phone-pad"
        defaultValue={emergencyPhoneRef.current}
        onCommit={v => { emergencyPhoneRef.current = v; }}
      />
      <FastInput
        label={t('regMedicalNotes')}
        hint={t('regMedicalHint')}
        placeholder={language === 'bn' ? 'যেমন: হাঁপানি, বাদাম অ্যালার্জি...' : 'e.g. Asthma, Peanut allergy...'}
        multiline
        numberOfLines={3}
        defaultValue={medicalNotesRef.current}
        onCommit={v => { medicalNotesRef.current = v; }}
      />
    </>
  );

  // ═══════════════════════════════════════════
  // STEP 3 — Location
  // ═══════════════════════════════════════════
  const renderStep3 = () => (
    <>
      <TouchableOpacity
        style={[styles.locationBtn, homeLocation && styles.locationBtnCaptured]}
        onPress={captureLocation}
        disabled={locLoading}
      >
        {locLoading ? (
          <ActivityIndicator color={COLORS.mint} size="small" />
        ) : (
          <Text style={[styles.locationBtnText, homeLocation && styles.locationBtnTextCaptured]}>
            {homeLocation ? t('regLocationCaptured') : t('regUseMyLocation')}
          </Text>
        )}
      </TouchableOpacity>

      {homeLocation && (
        <View style={styles.mapPreviewCard}>
          <Image
            source={{ uri: `https://staticmap.thisistim.dev/?center=${homeLocation.lat},${homeLocation.lng}&zoom=15&size=600x200&markers=${homeLocation.lat},${homeLocation.lng}` }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.mapCoordsRow}>
            <Text style={styles.mapCoordText}>
              📍 {homeLocation.lat.toFixed(5)}, {homeLocation.lng.toFixed(5)}
            </Text>
          </View>
        </View>
      )}

      <FastInput
        label={t('regHomeAddress')}
        placeholder={language === 'bn' ? 'বাড়ি নং, রাস্তা, এলাকা...' : 'House no, Street, Area...'}
        multiline
        numberOfLines={2}
        defaultValue={homeAddressRef.current}
        onCommit={v => { homeAddressRef.current = v; }}
      />
    </>
  );

  // ═══════════════════════════════════════════
  // STEP 4 — Consent
  // ═══════════════════════════════════════════
  const renderStep4 = () => (
    <>
      <View style={styles.consentCard}>
        <Text style={styles.consentTitle}>🛡️ {t('regConsentTitle')}</Text>
        <Text style={styles.consentBody}>{t('regConsentBody')}</Text>
      </View>

      <TouchableOpacity style={styles.formLinkBtn} onPress={openConsentForm}>
        <Text style={styles.formLinkBtnText}>{t('regOpenForm')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.checkboxRow, !formOpened && { opacity: 0.5 }]}
        onPress={() => {
          if (!formOpened) {
            setErrorMessage(language === 'bn' ? 'দয়া করে প্রথমে সম্মতি ফর্মটি খুলুন' : 'Please open the consent form first');
            return;
          }
          setErrorMessage('');
          setConsentChecked(c => !c);
        }}
      >
        <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
          {consentChecked && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{t('regConsentCheckbox')}</Text>
      </TouchableOpacity>
    </>
  );

  // ═══════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════
  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {renderProgressBar()}

      <Text style={styles.heading}>{t(stepTitleKey[step - 1])}</Text>
      <Text style={styles.subtext}>{t(stepSubKey[step - 1])}</Text>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {/* Navigation */}
      <View style={styles.navRow}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>{t('regBack')}</Text>
          </TouchableOpacity>
        ) : <View />}

        {step < TOTAL_STEPS ? (
          <View style={{ alignItems: 'flex-end' }}>
            {!!errorMessage && <Text style={{ color: 'red', fontSize: 13, marginBottom: 8, fontWeight: '700' }}>{errorMessage}</Text>}
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>{t('regNext')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: 'flex-end' }}>
            {!consentChecked && (
              <Text style={{ color: 'red', fontSize: 12, marginBottom: 8, fontWeight: '700' }}>
                {language === 'bn' ? '* নিবন্ধনের জন্য সম্মতি আবশ্যক' : '* Consent is required to register'}
              </Text>
            )}
            {!!errorMessage && <Text style={{ color: 'red', fontSize: 13, marginBottom: 8, fontWeight: '700' }}>{errorMessage}</Text>}
            <TouchableOpacity
              style={[styles.submitBtn, !consentChecked && styles.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={submitting || !consentChecked}
            >
              {submitting
                ? <ActivityIndicator color="#0B132B" size="small" />
                : <Text style={styles.submitBtnText}>{t('regSubmit')}</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
        <Text style={styles.linkText}>{t('hasAccount')}</Text>
      </TouchableOpacity>

      {/* Relationship Modal */}
      <Modal visible={showRelPicker} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('regRelationship')}</Text>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.modalOption, relationship === opt.key && styles.modalOptionActive]}
                onPress={() => { setRelationship(opt.key); setShowRelPicker(false); }}
              >
                <Text style={[styles.modalOptionText, relationship === opt.key && styles.modalOptionTextActive]}>
                  {opt[language] || opt.en}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRelPicker(false)}>
              <Text style={styles.modalCancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 50, backgroundColor: COLORS.background, flexGrow: 1 },

  // Progress
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  progressStepWrapper: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { borderColor: COLORS.mint, backgroundColor: '#ECFDF5' },
  progressDotDone: { backgroundColor: COLORS.mint, borderColor: COLORS.mint },
  progressDotText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF' },
  progressDotTextActive: { color: COLORS.mint },
  progressLine: { width: 36, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 2 },
  progressLineActive: { backgroundColor: COLORS.mint },

  // Header
  heading: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center' },
  subtext: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, marginTop: 4 },

  // Picker
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  pickerTriggerText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  pickerChevron: { fontSize: 14, color: COLORS.textMuted },

  // Location
  locationBtn: {
    backgroundColor: COLORS.card, borderColor: COLORS.mint, borderWidth: 1.5,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16, borderStyle: 'dashed',
  },
  locationBtnCaptured: { backgroundColor: '#ECFDF5', borderStyle: 'solid' },
  locationBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.mint },
  locationBtnTextCaptured: { color: '#059669' },
  mapPreviewCard: { borderRadius: 14, overflow: 'hidden', borderColor: COLORS.border, borderWidth: 1, marginBottom: 16 },
  mapImage: { width: '100%', height: 150, backgroundColor: '#E2E8F0' },
  mapCoordsRow: { paddingHorizontal: 14, paddingVertical: 10 },
  mapCoordText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },

  // Consent
  consentCard: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC', borderWidth: 1.5, borderRadius: 14, padding: 16, marginBottom: 16 },
  consentTitle: { fontSize: 16, fontWeight: '900', color: '#065F46', marginBottom: 10 },
  consentBody: { fontSize: 13, color: '#047857', lineHeight: 20 },
  formLinkBtn: { backgroundColor: COLORS.card, borderColor: COLORS.mint, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  formLinkBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.mint },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#FFFFFF' },
  checkboxChecked: { backgroundColor: COLORS.mint, borderColor: COLORS.mint },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  checkboxLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },

  // Nav buttons
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  backBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#F1F5F9' },
  backBtnText: { fontSize: 14, fontWeight: '800', color: '#6B7280' },
  nextBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, backgroundColor: COLORS.mint, elevation: 2 },
  nextBtnText: { fontSize: 14, fontWeight: '800', color: '#0B132B' },
  submitBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, backgroundColor: COLORS.mint, elevation: 2 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#0B132B' },

  // Link
  linkButton: { marginTop: 20, marginBottom: 30, alignItems: 'center' },
  linkText: { color: COLORS.mint, fontSize: 14, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 14 },
  modalOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 6, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1 },
  modalOptionActive: { backgroundColor: '#ECFDF5', borderColor: COLORS.mint },
  modalOptionText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  modalOptionTextActive: { color: COLORS.mint },
  modalCancel: { marginTop: 10, padding: 10, alignItems: 'center' },
  modalCancelText: { fontSize: 18, color: '#9CA3AF', fontWeight: '600' },
});
