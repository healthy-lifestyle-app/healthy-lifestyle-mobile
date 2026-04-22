import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { getOnboardingDone } from '@/lib/storage';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik bilgi', 'E-posta ve şifre alanlarını doldur.');
      return;
    }

    try {
      setIsSubmitting(true);

      await signIn({
        email: email.trim(),
        password,
      });

      const onboardingDone = await getOnboardingDone();

      if (onboardingDone !== '1') {
        router.replace('/onboarding/welcome');
        return;
      }

      router.replace('/(tabs)/home');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu.';
      Alert.alert('Giriş başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>
          Hesabına giriş yaparak kaldığın yerden devam et.
        </Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta"
            placeholderTextColor="#98A2B3"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Şifre"
            placeholderTextColor="#98A2B3"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Pressable
            onPress={handleLogin}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <Link href="/auth/signup" style={styles.link}>
            Kayıt ol
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1D2939',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#667085',
    marginBottom: 28,
    lineHeight: 22,
  },
  form: {
    gap: 14,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#101828',
  },
  button: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A8C85A',
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#667085',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A9E35',
  },
});