import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text, Modal } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
  name="nutrition"
  options={{
    title: 'Beslenme',
    popToTopOnBlur: true,
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="leaf.fill" color={color} />
    ),
  }}
/>

        <Tabs.Screen
          name="exercise/index"
          options={{
            title: 'Egzersiz',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="figure.walk" color={color} />
            ),
          }}
        />

        <Tabs.Screen
  name="recipes"
  options={{
    title: 'Tarifler',
    tabBarLabel: 'Tarifler',
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="fork.knife" color={color} />
    ),
  }}
/>

        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen name="home/detail" options={{ href: null }} />
        <Tabs.Screen name="nutrition/add-meal" options={{ href: null }} />
        <Tabs.Screen name="nutrition/scan" options={{ href: null }} />
        <Tabs.Screen name="exercise/[id]" options={{ href: null }} />
        <Tabs.Screen name="exercise/workout/[id]" options={{ href: null }} />
        <Tabs.Screen name="exercise/session/[id]" options={{ href: null }} />
        <Tabs.Screen name="exercise/session-exercise/[id]" options={{ href: null }} />
        <Tabs.Screen name="recipes/add" options={{ href: null }} />
        <Tabs.Screen name="recipes/[id]" options={{ href: null }} />
        <Tabs.Screen name="recipes/my-recipes" options={{ href: null }} />
        <Tabs.Screen name="onboarding" options={{ href: null }} />
      </Tabs>

      <Pressable
        style={styles.chatButton}
        onPress={() => setChatVisible(true)}
      >
        <Text style={styles.chatIcon}>🤖</Text>
      </Pressable>

      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.chatModal}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>AI Asistan</Text>
              <Pressable onPress={() => setChatVisible(false)}>
                <Text style={styles.closeText}>Kapat</Text>
              </Pressable>
            </View>

            <View style={styles.chatBody}>
              <Text style={styles.chatPlaceholder}>
                Buraya chatbot ekranın gelecek.
              </Text>
              <Text style={styles.chatPlaceholder}>
                Örn: “Bugünkü beslenmemi yorumla”, “Akşam yemeği öner”, “Kalori açığım ne kadar?”
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatButton: {
    position: 'absolute',
    right: 18,
    bottom: 90,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EAF4D3',
    borderWidth: 1.5,
    borderColor: '#A8C85A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
    zIndex: 999,
  },
  chatIcon: {
    fontSize: 26,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  chatModal: {
    height: '75%',
    backgroundColor: '#F8F5EE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2A27',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A8C85A',
  },
  chatBody: {
    flex: 1,
    marginTop: 20,
    gap: 12,
  },
  chatPlaceholder: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B4B4B',
  },
});