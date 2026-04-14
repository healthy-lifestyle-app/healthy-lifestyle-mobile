import React from "react";
import { Pressable, Text, StyleProp, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({ title, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          paddingVertical: 16,
          borderRadius: 22,
          alignItems: "center",
          backgroundColor: "#2F8F4E",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
        {title}
      </Text>
    </Pressable>
  );
}