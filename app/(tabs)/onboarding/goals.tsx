import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/button";

type Goal = {
  key: string;
  label: string;
};

const GOALS: Goal[] = [
  { key: "healthy", label: "Sağlıklı Yaşam" },
  { key: "lose", label: "Kilo Vermek" },
  { key: "gain", label: "Kilo Almak" },
  { key: "maintain", label: "Formumu Korumak" },
  { key: "energy", label: "Daha Enerjik Hissetmek" },
];

export default function Goals() {
  const [selected, setSelected] = useState<string[]>([]);
  const canFinish = selected.length > 0;

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const selectedText = useMemo(() => {
    if (selected.length === 0) return "Henüz hedef seçmedin.";
    return `${selected.length} hedef seçildi.`;
  }, [selected]);

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
    <View style={{ flex: 1, padding: 20, justifyContent: "space-between" }}>
      <View style={{ gap: 12, marginTop: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "900" }}>Hedeflerin</Text>
        <Text style={{ opacity: 0.7 }}>Birden fazla hedef seçebilirsin.</Text>

        <Text style={{ fontSize: 13, opacity: 0.6 }}>{selectedText}</Text>

        <View style={{ gap: 10, marginTop: 14 }}>
          {GOALS.map((g) => {
            const isOn = selected.includes(g.key);
            return (
              <Pressable
                key={g.key}
                onPress={() => toggle(g.key)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: isOn ? "#2F8F4E" : "rgba(0,0,0,0.12)",
                  backgroundColor: isOn ? "rgba(47,143,78,0.12)" : "#FFFFFF",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700" }}>
                  {g.label}
                </Text>

                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: isOn ? "#2F8F4E" : "rgba(0,0,0,0.25)",
                    backgroundColor: isOn ? "#2F8F4E" : "transparent",
                  }}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Progress (4/4) */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#8EA76A" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#8EA76A" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#8EA76A" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#8EA76A" }} />
        </View>
      </View>

      <Button title="Bitir ✓" onPress={handleFinish} disabled={!canFinish} />
    </View>
  );
}