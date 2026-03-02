import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
  name="nutrition"
  options={{
    title: "Beslenme",
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="leaf.fill" color={color} />
    ),
  }}
/>
<Tabs.Screen
  name="exercise"
  options={{
    title: "Egzersiz",
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="figure.walk" color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="recipes"
  options={{
    title: "Tarifler",
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="book.fill" color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="profile"
  options={{
    title: "Profil",
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="person.fill" color={color} />
    ),
  }}
/>
    </Tabs>
  );
}