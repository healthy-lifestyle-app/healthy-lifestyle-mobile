import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  accessToken: 'access_token',
  onboardingDone: 'onboarding_done',
} as const;

export async function setAccessToken(token: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.accessToken, token);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
}

export async function removeAccessToken() {
  await AsyncStorage.removeItem(STORAGE_KEYS.accessToken);
}

export async function setOnboardingDone() {
  await AsyncStorage.setItem(STORAGE_KEYS.onboardingDone, '1');
}

export async function getOnboardingDone() {
  return AsyncStorage.getItem(STORAGE_KEYS.onboardingDone);
}

export async function clearSession() {
  await removeAccessToken();
}