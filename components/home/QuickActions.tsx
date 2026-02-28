import { View, Pressable, Text } from "react-native";
import { router } from "expo-router";

function ActionButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: "#F2F3F5",
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}

export default function QuickActions() {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Hızlı İşlemler
      </Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <ActionButton
          title="Öğün Ekle"
          onPress={() => router.push("/nutrition/add-meal")}
        />
        <ActionButton
          title="Ürün Tara"
          onPress={() => router.push("/nutrition/scan")}
        />
      </View>
    </View>
  );
}