import { View, Pressable, Text } from "react-native";
import React from "react";

const moods = ["😥", "😐", "🙂", "😄", "🤩"];

export default function MoodRow() {
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <View style={{ flexDirection: "row", gap: 14, paddingVertical: 6 }}>
      {moods.map((m, i) => {
        const active = selected === i;
        return (
          <Pressable
            key={m}
            onPress={() => setSelected(i)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? "#F2F3F5" : "transparent",
            }}
          >
            <Text style={{ fontSize: 20 }}>{m}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}