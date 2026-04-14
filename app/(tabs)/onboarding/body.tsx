import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/button";

export default function Body() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const canNext = Number(height) > 0 && Number(weight) > 0;

  const handleNext = async () => {
    Keyboard.dismiss();

    if (!canNext) return;

    const raw = await AsyncStorage.getItem("onboarding_profile");
    const profile = raw ? JSON.parse(raw) : {};

    profile.height = Number(height);
    profile.weight = Number(weight);

    await AsyncStorage.setItem("onboarding_profile", JSON.stringify(profile));

    router.push("/onboarding/goals");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 36,
            paddingBottom: 24,
            justifyContent: "space-between",
          }}
        >
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 31,
                fontWeight: "900",
                color: "#2B2B2B",
                marginBottom: 8,
              }}
            >
              Vücut Bilgilerin 📏
            </Text>

            <Text
              style={{
                color: "#6F6F6F",
                fontSize: 14,
                lineHeight: 21,
                marginBottom: 18,
              }}
            >
              Sana uygun hedefleri belirlemek için boy ve kilonu alalım.
            </Text>

            <View
              style={{
                backgroundColor: "#A8C85A",
                borderRadius: 18,
                padding: 10,
                gap: 10,
              }}
            >
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder="Boyun (cm)"
                placeholderTextColor="#A7A7A7"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 14,
                  color: "#2B2B2B",
                }}
              />

              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="Kilon (kg)"
                placeholderTextColor="#A7A7A7"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 14,
                  color: "#2B2B2B",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 18,
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
                  backgroundColor: "#D9D9D9",
                }}
              />
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button
              title="Devam et ›"
              onPress={handleNext}
              disabled={!canNext}
              style={{ backgroundColor: "#A8C85A", borderRadius: 999 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}