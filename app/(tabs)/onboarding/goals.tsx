import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/button";

type Goal = {
  key: string;
  label: string;
  icon: string;
  bgColor: string;
  iconBg: string;
  textColor?: string;
};

const GOALS: Goal[] = [
  {
    key: "healthy",
    label: "Sağlıklı yaşam",
    icon: "♡",
    bgColor: "#C7DC78",
    iconBg: "#EEF5D6",
    textColor: "#FFFFFF",
  },
  {
    key: "lose",
    label: "Kilo Vermek",
    icon: "🥗",
    bgColor: "#F4E3C3",
    iconBg: "#F9EFE0",
    textColor: "#5B5B5B",
  },
  {
    key: "gain",
    label: "Kilo Almak",
    icon: "◎",
    bgColor: "#E7E0F7",
    iconBg: "#F1ECFB",
    textColor: "#6A6680",
  },
  {
    key: "maintain",
    label: "Formumu Korumak",
    icon: "✧",
    bgColor: "#8D81C9",
    iconBg: "#B3A8E4",
    textColor: "#FFFFFF",
  },
];

export default function Goals() {
  const [selected, setSelected] = useState<string[]>([]);

  const canFinish = selected.length > 0;

  const toggle = (key: string) => {
  setSelected((prev) =>
    prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
  );
};

  const handleFinish = async () => {
    if (!canFinish) return;

    const raw = await AsyncStorage.getItem("onboarding_profile");
    const profile = raw ? JSON.parse(raw) : {};

    profile.goals = selected;

    await AsyncStorage.setItem("onboarding_profile", JSON.stringify(profile));
    await AsyncStorage.setItem("onboarding_done", "1");

    router.replace("/(tabs)/home");
  };

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
      <View style={{ marginTop: 24 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#2F2F2F",
            marginBottom: 6,
          }}
        >
          Hedefin ne ?
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: "#6F6F6F",
            marginBottom: 18,
          }}
        >
          Birlikte çalışalım
        </Text>

        <View style={{ gap: 12 }}>
          {GOALS.map((goal) => {
            const isSelected = selected.includes(goal.key);

            return (
              <Pressable
                key={goal.key}
                onPress={() => toggle(goal.key)}
                style={{
                  minHeight: 64,
                  borderRadius: 18,
                  backgroundColor: goal.bgColor,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: isSelected ? 4 : 1,
                  borderColor: isSelected ? "#6E9135" : "transparent",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: goal.iconBg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color:
                        goal.textColor === "#FFFFFF" ? "#FFFFFF" : "#7C7C7C",
                    }}
                  >
                    {goal.icon}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: goal.textColor ?? "#2B2B2B",
                  }}
                >
                  {goal.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 20,
            justifyContent: "center",
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
              backgroundColor: "#A8C85A",
            }}
          />
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
              backgroundColor: "#A8C85A",
            }}
          />
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <Button
          title="Devam et ›"
          onPress={handleFinish}
          disabled={!canFinish}
          style={{ backgroundColor: "#A8C85A", borderRadius: 999 }}
        />
      </View>
    </View>
  );
}