import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function NutritionScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 22 }}>Beslenme</Text>

      <Button title="Öğün Ekle" onPress={() => router.push("/nutrition/add-meal")} />
      <Button title="Foto Kalori" onPress={() => router.push("/nutrition/scan")} />
    </View>
  );
}