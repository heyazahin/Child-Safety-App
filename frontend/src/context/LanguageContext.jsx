import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('bn'); // Default to Bangla for maximum accessibility

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang && (savedLang === 'en' || savedLang === 'bn')) {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const changeLanguage = async (newLang) => {
    try {
      setLanguage(newLang);
      await AsyncStorage.setItem('appLanguage', newLang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key) => {
    if (!translations[language] || !translations[language][key]) {
      // Fallback to English if translation key is missing
      return translations.en[key] || key;
    }
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
