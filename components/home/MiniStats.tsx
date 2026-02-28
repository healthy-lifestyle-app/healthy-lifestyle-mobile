import { View, Text } from "react-native";

function Ring({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      {/* Fake ring (placeholder). İstersen sonra gerçek progress ring yaparız */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 10,
          borderColor: accent,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800" }}>{value}</Text>
        <Text style={{ fontSize: 13, opacity: 0.65 }}>{label}</Text>
      </View>
    </View>
  );
}

export default function RingStats({
  kcal,
  steps,
}: {
  kcal: number;
  steps: number;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 14, justifyContent: "space-between" }}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Ring value={kcal.toLocaleString("tr-TR")} label="kcal" accent="#9AB26B" />
      </View>

      <View style={{ flex: 1, alignItems: "center" }}>
        <Ring value={steps.toLocaleString("tr-TR")} label="adım" accent="#B8B6E8" />
      </View>
    </View>
  );
}