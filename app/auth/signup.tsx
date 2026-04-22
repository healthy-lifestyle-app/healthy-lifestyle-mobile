import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import Button from '@/components/button';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.includes('@') && pass.length >= 6 && !isSubmitting;

  const handleNext = async () => {
    Keyboard.dismiss();

    if (!canSubmit) return;

    try {
      setIsSubmitting(true);

      await signUp({
        email: email.trim(),
        password: pass,
      });

      router.replace('/onboarding/welcome');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Kayıt oluşturulurken bir hata oluştu.';

      Alert.alert('Kayıt başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 36,
            paddingBottom: 24,
            justifyContent: 'space-between',
          }}>
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 31,
                fontWeight: '900',
                color: '#2B2B2B',
                marginBottom: 8,
              }}>
              Mail ile Kayıt 📩
            </Text>

            <Text
              style={{
                color: '#6F6F6F',
                fontSize: 14,
                lineHeight: 21,
                marginBottom: 18,
              }}>
              Hesabını oluşturmak için mail adresini ve şifreni gir.
            </Text>

            <View
              style={{
                backgroundColor: '#A8C85A',
                borderRadius: 18,
                padding: 10,
                gap: 10,
              }}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@mail.com"
                placeholderTextColor="#A7A7A7"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                editable={!isSubmitting}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 14,
                  color: '#2B2B2B',
                }}
              />

              <TextInput
                value={pass}
                onChangeText={setPass}
                placeholder="Şifre (min 6 karakter)"
                placeholderTextColor="#A7A7A7"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                editable={!isSubmitting}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 14,
                  color: '#2B2B2B',
                }}
              />
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button
              title={isSubmitting ? 'Kayıt oluşturuluyor...' : 'Devam et ›'}
              onPress={handleNext}
              disabled={!canSubmit}
              style={{ backgroundColor: '#A8C85A', borderRadius: 999 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}