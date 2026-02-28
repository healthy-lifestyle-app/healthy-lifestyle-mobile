import { View, Text, Image } from "react-native";

export default function Header({ name }: { name: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ gap: 6, flex: 1, paddingRight: 12 }}>
        <Text style={{ fontSize: 26, fontWeight: "800" }}>Merhaba, {name}! 👋</Text>
        <Text style={{ fontSize: 16, opacity: 0.7 }}>Bugün kendini nasıl hissediyorsun?</Text>
      </View>

      <Image
        source={{ uri: "https://i.pravatar.cc/120" }}
        style={{ width: 54, height: 54, borderRadius: 18 }}
      />
    </View>
  );
}