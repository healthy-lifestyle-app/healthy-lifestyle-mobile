import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Onboarding() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 20,
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: "800" }}>
        Healthy Lifestyle 👋
      </Text>

      <Text style={{ textAlign: "center", opacity: 0.7 }}>
        Hedeflerini belirle ve sağlıklı yaşam yolculuğuna başla.
      </Text>

      <Pressable
        onPress={() => router.replace("/(tabs)/home")}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 18,
          backgroundColor: "#2F8F4E",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          Başla
        </Text>
      </Pressable>
    </View>
  );
}   