export const translations = {
  en: {
    // Branding & Roles
    appName: 'SafeNest',
    tagline: 'Child Safety & Emergency Monitoring',
    roleGuardian: 'GUARDIAN CONSOLE',
    roleAdmin: 'ADMIN CONSOLE',

    // Navigation Tabs
    tabHome: 'Home',
    tabMonitor: 'Live Monitor',
    tabAlerts: 'Alert History',
    tabSettings: 'Settings',
    tabChildren: 'Children',
    tabUsers: 'Users',
    tabSimulate: 'Test Simulator',

    // Child Status
    statusSafe: 'SAFE',
    statusDistress: 'HELP NEEDED!',
    statusOffline: 'OFFLINE',
    safeMsg: 'Everything is safe and normal.',
    distressMsg: 'Emergency detected! Please reach child immediately.',
    offlineMsg: 'Device is offline or disconnected.',

    // Vitals & Metrics
    vitalsTitle: 'HEALTH & VITALS',
    heartRate: 'Heart Rate',
    stressLevel: 'Stress Level (GSR)',
    breathing: 'Breathing Rate',
    movement: 'Movement State',
    bpm: 'bpm',
    us: 'μS',
    breaths: 'breaths/min',

    // Metric States
    normal: 'Normal',
    elevated: 'Elevated',
    high: 'High',
    low: 'Resting / Low',
    medium: 'Moderate',
    calm: 'Calm',
    moving: 'Active Movement',

    // Actions & Buttons
    refreshBtn: 'Refresh Status',
    refreshing: 'Updating...',
    callEmergency: 'Call Emergency Contact',
    sendPanicAlert: 'Send Emergency SOS Signal',
    acknowledgeAlert: 'Acknowledge Alert',
    acknowledged: 'Acknowledged',
    saveSettings: 'Save Settings',
    logout: 'Sign Out',

    // Language & Settings
    languageLabel: 'Language / ভাষা',
    english: 'English',
    bangla: 'বাংলা',
    guardianSettings: 'Guardian Preferences',
    pushNotifications: 'Push Alert Notifications',
    autoCall: 'Automatic Emergency Calling',
    emergencyPhone: 'Emergency Phone Number',

    // Admin Labels
    adminOverview: 'System Status Overview',
    totalMonitored: 'Total Monitored Children',
    activeGuardians: 'Active Guardians',
    distressCount: 'Distress Incidents',
    systemHealth: 'System Health',
    simulatorTitle: 'Distress Alert Testing Simulator',
    triggerSim: 'Trigger Simulated Distress Event',
    simulatedSuccess: 'Simulated distress signal sent!',

    // Common
    child: 'Child',
    age: 'Years old',
    school: 'School',
    lastUpdated: 'Updated:',
    phone: 'Phone',
    email: 'Email',
    password: 'Password',
    loginBtn: 'Sign In',
    registerBtn: 'Create Guardian Account',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Sign in',

    // ── Registration Wizard ──
    regStep1Title: 'Guardian Details',
    regStep1Subtitle: 'Your identity as a guardian',
    regStep2Title: 'Child Information',
    regStep2Subtitle: 'Link or register a child',
    regStep3Title: 'Location',
    regStep3Subtitle: 'Your home location for emergencies',
    regStep4Title: 'Consent',
    regStep4Subtitle: 'Privacy & data consent',

    regFullName: 'Full Name',
    regRelationship: 'Your Relationship to Child',
    regRelFather: 'Father',
    regRelMother: 'Mother',
    regRelGuardian: 'Legal Guardian',
    regRelTeacher: 'Teacher',
    regRelOther: 'Other',

    regEmergencyName: 'Emergency Contact Name',
    regEmergencyPhone: 'Emergency Contact Phone',
    regEmergencyHint: 'A backup person to call if you are unreachable',

    regChildCode: 'Child Code (if assigned)',
    regChildCodeHint: 'Enter the code given by the admin to link a child',
    regMedicalNotes: 'Known Medical Conditions / Allergies',
    regMedicalHint: 'Helps responders during an emergency',

    regUseMyLocation: '📍 Use My Current Location',
    regLocationCaptured: '✅ Location captured successfully',
    regLocationFailed: 'Could not capture location. Please allow GPS access.',
    regHomeAddress: 'Home Address (optional backup)',

    regConsentTitle: 'Data Collection Consent',
    regConsentBody: 'SafeNest collects the following data to protect your child:\n\n• Heart rate, stress level, breathing, and motion data from the wearable device\n• Your registered location for emergency response\n• Emergency contact information\n\nAll data is encrypted and used solely for child safety monitoring. No data is shared with third parties.',
    regOpenForm: '📋 Open Full Consent Form',
    regConsentCheckbox: 'I have read and agree to the data collection terms',
    regConsentRequired: 'You must agree to the consent terms to register',

    regNext: 'Next →',
    regBack: '← Back',
    regSubmit: 'Create Account',
    regStepOf: 'Step {step} of {total}',
    regRequiredFields: 'Please fill in all required fields',

    regMyLocation: 'My Location',
    regUpdateLocation: 'Update Location',
    regNoLocation: 'No location set',
  },
  bn: {
    // Branding & Roles
    appName: 'সেফনেস্ট',
    tagline: 'শিশু সুরক্ষার নিরাপদ সঙ্গী',
    roleGuardian: 'অভিভাবক প্যানেল',
    roleAdmin: 'এডমিন প্যানেল',

    // Navigation Tabs
    tabHome: 'হোম',
    tabMonitor: 'লাইভ মনিটর',
    tabAlerts: 'জরুরি বার্তা',
    tabSettings: 'সেটিংস',
    tabChildren: 'শিশু তালিকা',
    tabUsers: 'ব্যবহারকারী',
    tabSimulate: 'টেস্ট টুল',

    // Child Status
    statusSafe: 'নিরাপদ',
    statusDistress: 'জরুরি সাহায্য দরকার!',
    statusOffline: 'অফলাইন',
    safeMsg: 'শিশু সম্পূর্ণ নিরাপদ ও স্বাভাবিক রয়েছে।',
    distressMsg: 'জরুরি পরিস্থিতি তৈরি হয়েছে! দ্রুত শিশুর সাথে যোগাযোগ করুন।',
    offlineMsg: 'ডিভাইস সংযোগ বিচ্ছিন্ন রয়েছে।',

    // Vitals & Metrics
    vitalsTitle: 'স্বাস্থ্য ও শারীরিক অবস্থা',
    heartRate: 'হৃদস্পন্দন (Heart Rate)',
    stressLevel: 'মানসিক চাপ (Stress Level)',
    breathing: 'শ্বাসপ্রশ্বাস (Breathing Rate)',
    movement: 'চলাচল (Movement)',
    bpm: 'বার/মিনিট',
    us: 'মাইক্রো-সিমেন্স',
    breaths: 'বার/মিনিট',

    // Metric States
    normal: 'স্বাভাবিক',
    elevated: 'কিছুটা বেশি',
    high: 'অনেক বেশি',
    low: 'স্থির / কম',
    medium: 'মাঝারি',
    calm: 'শান্ত',
    moving: 'চলাচলরত',

    // Actions & Buttons
    refreshBtn: 'তথ্য হালনাগাদ করুন',
    refreshing: 'হালনাগাদ হচ্ছে...',
    callEmergency: 'জরুরি নম্বরে কল দিন',
    sendPanicAlert: 'জরুরি সাহায্য সংকেত পাঠান (SOS)',
    acknowledgeAlert: 'বার্তা গ্রহণ করেছি',
    acknowledged: 'গৃহীত হয়েছে',
    saveSettings: 'সেটিংস সংরক্ষণ করুন',
    logout: 'লগ আউট',

    // Language & Settings
    languageLabel: 'ভাষা নির্বাচন (Language)',
    english: 'English',
    bangla: 'বাংলা',
    guardianSettings: 'অভিভাবক সেটিংস',
    pushNotifications: 'জরুরি নোটিফিকেশন এলার্ট',
    autoCall: 'স্বয়ংক্রিয় জরুরি ফোন কল',
    emergencyPhone: 'জরুরি মোবাইল নম্বর',

    // Admin Labels
    adminOverview: 'সিস্টেম ওভারভিউ',
    totalMonitored: 'মোট নজরদারিতে থাকা শিশু',
    activeGuardians: 'সংযুক্ত অভিভাবক',
    distressCount: 'জরুরি সংকেতের সংখ্যা',
    systemHealth: 'সিস্টেম স্ট্যাটাস',
    simulatorTitle: 'জরুরি সংকেত পরীক্ষা করার টুল',
    triggerSim: 'পরীক্ষামূলক জরুরি সংকেত পাঠান',
    simulatedSuccess: 'পরীক্ষামূলক সংকেত পাঠানো হয়েছে!',

    // Common
    child: 'শিশু',
    age: 'বছর বয়স',
    school: 'বিদ্যালয়',
    lastUpdated: 'হালনাগাদ:',
    phone: 'মোবাইল নম্বর',
    email: 'ইমেইল এড্রেস',
    password: 'পাসওয়ার্ড',
    loginBtn: 'লগ ইন করুন',
    registerBtn: 'নতুন অ্যাকাউন্ট তৈরি করুন',
    noAccount: 'অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্ট তৈরি করুন',
    hasAccount: 'আগে থেকেই অ্যাকাউন্ট আছে? লগ ইন করুন',

    // ── Registration Wizard ──
    regStep1Title: 'অভিভাবকের তথ্য',
    regStep1Subtitle: 'আপনার পরিচয় দিন',
    regStep2Title: 'শিশুর তথ্য',
    regStep2Subtitle: 'শিশু যুক্ত করুন বা কোড দিন',
    regStep3Title: 'অবস্থান',
    regStep3Subtitle: 'জরুরি সময়ে আপনার বাড়ির অবস্থান',
    regStep4Title: 'সম্মতি',
    regStep4Subtitle: 'গোপনীয়তা ও তথ্য সম্মতি',

    regFullName: 'পূর্ণ নাম',
    regRelationship: 'শিশুর সাথে আপনার সম্পর্ক',
    regRelFather: 'বাবা',
    regRelMother: 'মা',
    regRelGuardian: 'আইনি অভিভাবক',
    regRelTeacher: 'শিক্ষক',
    regRelOther: 'অন্যান্য',

    regEmergencyName: 'জরুরি যোগাযোগ ব্যক্তির নাম',
    regEmergencyPhone: 'জরুরি যোগাযোগ ফোন নম্বর',
    regEmergencyHint: 'আপনার সাথে যোগাযোগ না হলে এই ব্যক্তিকে জানানো হবে',

    regChildCode: 'শিশুর কোড (যদি থাকে)',
    regChildCodeHint: 'এডমিনের দেওয়া কোড দিন',
    regMedicalNotes: 'পরিচিত রোগ বা অ্যালার্জি',
    regMedicalHint: 'জরুরি সময়ে সাহায্যকারীদের সাহায্য করবে',

    regUseMyLocation: '📍 আমার অবস্থান ব্যবহার করুন',
    regLocationCaptured: '✅ অবস্থান সফলভাবে সংগ্রহ করা হয়েছে',
    regLocationFailed: 'অবস্থান সংগ্রহ হয়নি। দয়া করে GPS অনুমতি দিন।',
    regHomeAddress: 'বাড়ির ঠিকানা (ঐচ্ছিক)',

    regConsentTitle: 'তথ্য সংগ্রহের সম্মতি',
    regConsentBody: 'সেফনেস্ট আপনার শিশুর সুরক্ষার জন্য নিম্নলিখিত তথ্য সংগ্রহ করে:\n\n• হৃদস্পন্দন, মানসিক চাপ, শ্বাসপ্রশ্বাস এবং চলাচল তথ্য\n• জরুরি প্রতিক্রিয়ার জন্য আপনার নিবন্ধিত অবস্থান\n• জরুরি যোগাযোগ তথ্য\n\nসমস্ত তথ্য এনক্রিপ্ট করা হয় এবং শুধুমাত্র শিশু সুরক্ষা পর্যবেক্ষণে ব্যবহৃত হয়। তৃতীয় পক্ষের সাথে কোন তথ্য শেয়ার করা হয় না।',
    regOpenForm: '📋 সম্পূর্ণ সম্মতি ফর্ম দেখুন',
    regConsentCheckbox: 'আমি তথ্য সংগ্রহের শর্তাবলী পড়েছি এবং সম্মত',
    regConsentRequired: 'নিবন্ধনের জন্য আপনাকে সম্মতি দিতে হবে',

    regNext: 'পরবর্তী →',
    regBack: '← পূর্ববর্তী',
    regSubmit: 'অ্যাকাউন্ট তৈরি করুন',
    regStepOf: 'ধাপ {step} / {total}',
    regRequiredFields: 'দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন',

    regMyLocation: 'আমার অবস্থান',
    regUpdateLocation: 'অবস্থান হালনাগাদ করুন',
    regNoLocation: 'অবস্থান নির্ধারিত নেই',
  }
};
