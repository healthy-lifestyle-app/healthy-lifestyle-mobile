import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/button";

export default function Profile() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const canNext = name.trim().length >= 2 && Number(age) > 0;

  const handleNext = async () => {
    if (!canNext) return;

    const raw = await AsyncStorage.getItem("onboarding_profile");
    const profile = raw ? JSON.parse(raw) : {};

    profile.name = name.trim();
    profile.age = Number(age);

    await AsyncStorage.setItem("onboarding_profile", JSON.stringify(profile));

    router.push("/onboarding/body");
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "space-between" }}>
      <View style={{ gap: 12, marginTop: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "900" }}>Kendini Tanıt</Text>
        <Text style={{ opacity: 0.7 }}>
          Sana uygun hedefler belirlemek için birkaç bilgi alalım.
        </Text>

        <View style={{ gap: 8, marginTop: 14 }}>
          <Text style={{ fontWeight: "700" }}>İsim</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Örn: Beyza"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.15)",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          />

          <Text style={{ fontWeight: "700", marginTop: 10 }}>Yaş</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="Örn: 22"
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.15)",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          />
        </View>

        {/* Progress (2/4) */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#8EA76A" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#8EA76A" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.15)" }} />
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.15)" }} />
        </View>
      </View>

      <Button title="Devam Et →" onPress={handleNext} disabled={!canNext} />
    </View>
  );
}