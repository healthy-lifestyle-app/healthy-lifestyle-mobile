import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Welcome() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 24,
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            backgroundColor: "#A8C85A",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Text style={{ fontSize: 34 }}>🌿</Text>
        </View>

        <Text
          style={{
            fontSize: 32,
            fontWeight: "900",
            color: "#2B2B2B",
            marginBottom: 10,
          }}
        >
          Hoş Geldin! ☘️
        </Text>

        <Text
          style={{
            textAlign: "center",
            color: "#6F6F6F",
            fontSize: 14,
            lineHeight: 21,
            maxWidth: 260,
          }}
        >
          Sağlıklı yaşam yolculuğuna başlamak{"\n"}için seni daha iyi tanıyalım
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 20,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              backgroundColor: "#A8C85A",
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              backgroundColor: "#D9D9D9",
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              backgroundColor: "#D9D9D9",
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              backgroundColor: "#D9D9D9",
            }}
          />
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/onboarding/profile")}
        style={{
          paddingVertical: 16,
          borderRadius: 999,
          backgroundColor: "#B8D56B",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontWeight: "700",
            fontSize: 15,
          }}
        >
          Devam et ›
        </Text>
      </Pressable>
    </View>
  );
}