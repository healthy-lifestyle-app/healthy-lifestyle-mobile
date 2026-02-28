import { ScrollView, View, Text, Pressable } from "react-native";
import { router } from "expo-router";

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#F2F3F5",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 13, opacity: 0.7 }}>{title}</Text>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>{value}</Text>
      {subtitle ? <Text style={{ fontSize: 13, opacity: 0.6 }}>{subtitle}</Text> : null}
    </View>
  );
}

function Action({
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
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 18,
        backgroundColor: "#EEF3E6",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View style={{ gap: 16 }}>
        {/* Header */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 26, fontWeight: "900" }}>Merhaba 👋</Text>
          <Text style={{ fontSize: 16, opacity: 0.7 }}>
            Bugün hedeflerine yaklaşalım.
          </Text>
        </View>

        {/* Mini stats */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card title="Kalori" value="— kcal" subtitle="Günlük" />
          <Card title="Adım" value="—" subtitle="Bugün" />
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card title="Su" value="— / 8" subtitle="bardak" />
          <Card title="Egzersiz" value="— dk" subtitle="bugün" />
        </View>

        {/* Actions */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "800" }}>Hızlı İşlemler</Text>

          <Action title="Öğün Ekle" onPress={() => router.push("/nutrition/add-meal")} />
          <Action title="Ürün Tara" onPress={() => router.push("/nutrition/scan")} />
        </View>
      </View>
    </ScrollView>
  );
}