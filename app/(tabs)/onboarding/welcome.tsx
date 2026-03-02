import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Welcome() {
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "space-between" }}>
      <View style={{ alignItems: "center", marginTop: 50, gap: 16 }}>
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 999,
            backgroundColor: "#B9C59A",
          }}
        />

        <Text style={{ fontSize: 30, fontWeight: "900", color: "#3A3F63" }}>
          Hoş Geldin! 🌱
        </Text>

        <Text style={{ textAlign: "center", opacity: 0.7, fontSize: 16 }}>
          Sağlıklı yaşam yolculuğuna başlamak için{"\n"}seni daha iyi tanıyalım
        </Text>

        {/* Progress dots (şimdilik basit) */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#8EA76A" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.15)" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.15)" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.15)" }} />
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/onboarding/profile")}
        style={{
          paddingVertical: 16,
          borderRadius: 22,
          backgroundColor: "#2F8F4E",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
          Devam Et  →
        </Text>
      </Pressable>
    </View>
  );
}