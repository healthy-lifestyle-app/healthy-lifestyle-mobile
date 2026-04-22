import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/components/Screen';

export default function Onboarding() {
  return (
    <Screen backgroundColor="#F8F6EC" edges={['top']} contentStyle={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Healthy Lifestyle</Text>
        <Text style={styles.subtitle}>
          Hedeflerini belirle ve sağlıklı yaşam yolculuğuna başla.
        </Text>

        <Pressable onPress={() => router.replace('/(tabs)/home')} style={styles.button}>
          <Text style={styles.buttonText}>Başla</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E6E2F0',
    padding: 18,
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F2430',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#7E8695',
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    marginTop: 8,
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A8C85A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});