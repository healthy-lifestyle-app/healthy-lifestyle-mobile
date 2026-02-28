import { View, Text } from "react-native";

function Bar({
  title,
  right,
  pct,
}: {
  title: string;
  right: string;
  pct: number;
}) {
  const clamped = Math.max(0, Math.min(1, pct));

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>{title}</Text>
        <Text style={{ fontSize: 14, opacity: 0.7 }}>{right}</Text>
      </View>

      <View style={{ height: 10, borderRadius: 999, backgroundColor: "#DADBE2", overflow: "hidden" }}>
        <View style={{ width: `${clamped * 100}%`, height: "100%", backgroundColor: "#4B4B6A" }} />
      </View>
    </View>
  );
}

export default function ProgressBars({
  water,
  waterPct,
  steps,
  stepsPct,
}: {
  water: string;
  waterPct: number;
  steps: string;
  stepsPct: number;
}) {
  return (
    <View style={{ padding: 16, borderRadius: 20, backgroundColor: "#F6F3EA", gap: 18 }}>
      <Bar title="Su Tüketimi" right={water} pct={waterPct} />
      <Bar title="Adım Hedefi" right={steps} pct={stepsPct} />
    </View>
  );
}