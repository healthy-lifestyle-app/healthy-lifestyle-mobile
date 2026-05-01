import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './resources/en';
import tr from './resources/tr';

export const LANGUAGE_STORAGE_KEY = 'app_language';

export type AppLanguage = 'tr' | 'en';

const resources = {
  tr: {
    translation: tr,
  },
  en: {
    translation: en,
  },
};

function getDeviceLanguage(): AppLanguage {
  const locales = Localization.getLocales();
  const languageCode = locales[0]?.languageCode;

  if (languageCode === 'en') {
    return 'en';
  }

  return 'tr';
}

export async function initI18n() {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

  const initialLanguage =
    savedLanguage === 'tr' || savedLanguage === 'en'
      ? savedLanguage
      : getDeviceLanguage();

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng: initialLanguage,
      fallbackLng: 'tr',
      interpolation: {
        escapeValue: false,
      },
    });

    return;
  }

  await i18n.changeLanguage(initialLanguage);
}

export async function changeAppLanguage(language: AppLanguage) {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export default i18n;