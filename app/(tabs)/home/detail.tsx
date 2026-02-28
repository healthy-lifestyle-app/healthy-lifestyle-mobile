import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function HomeDetailScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 20 }}>Home Detail</Text>
      <Button title="Geri" onPress={() => router.back()} />
    </View>
  );
}