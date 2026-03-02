import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const canSubmit = email.includes("@") && pass.length >= 6;

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: "900" }}>Mail ile Kayıt</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="ornek@mail.com"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.15)",
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      />

      <TextInput
        value={pass}
        onChangeText={setPass}
        placeholder="Şifre (min 6 karakter)"
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.15)",
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      />

      <Pressable
        disabled={!canSubmit}
        onPress={() => router.replace("/onboarding/welcome")}
        style={{
          marginTop: 8,
          paddingVertical: 14,
          borderRadius: 18,
          alignItems: "center",
          backgroundColor: "#2F8F4E",
          opacity: canSubmit ? 1 : 0.5,
        }}
      >
        <Text style={{ color: "white", fontWeight: "800" }}>Devam Et</Text>
      </Pressable>
    </View>
  );
}