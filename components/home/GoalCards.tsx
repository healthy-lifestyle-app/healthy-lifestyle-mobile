import { View, Text } from "react-native";

function MiniCard({
  icon,
  title,
  value,
  bg,
}: {
  icon: string;
  title: string;
  value: string;
  bg: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 18,
        backgroundColor: bg,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.7)",
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>

      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: 14, opacity: 0.7 }}>{title}</Text>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>{value}</Text>
      </View>
    </View>
  );
}

export default function MiniStats({
  waterText,
  exerciseText,
}: {
  waterText: string;
  exerciseText: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <MiniCard icon="💧" title="Su" value={waterText} bg="#F6F1E5" />
      <MiniCard icon="📈" title="Egzersiz" value={exerciseText} bg="#F4E6DF" />
    </View>
  );
}