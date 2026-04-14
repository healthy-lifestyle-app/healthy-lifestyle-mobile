import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";

function InfoCard({
  title,
  subtitle,
  rightTop,
  rightBottom,
  icon,
  iconBg,
}: {
  title: string;
  subtitle: string;
  rightTop?: string;
  rightBottom?: string;
  icon: string;
  iconBg: string;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoIconWrap, { backgroundColor: iconBg }]}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        {rightTop ? <Text style={styles.infoRight}>{rightTop}</Text> : null}
        {rightBottom ? <Text style={styles.infoRight}>{rightBottom}</Text> : null}
      </View>
    </View>
  );
}

function ProgressBlock({
  title,
  valueText,
  percent,
  color = "#7F74B8",
}: {
  title: string;
  valueText: string;
  percent: number;
  color?: string;
}) {
  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressTopRow}>
        <Text style={styles.progressTitle}>{title}</Text>
        <Text style={styles.progressValueText}>{valueText}</Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  iconBg,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>

      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

export default function HomeDetailScreen() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.topHandle} />

      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Günlük Detay</Text>

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Geri</Text>
        </Pressable>
      </View>

      <InfoCard
        title="Günlük Hedef"
        subtitle="10,000 adım tamamlama\n8 bardak su iç"
        rightTop="78%"
        rightBottom="75%"
        icon="◎"
        iconBg="#DDD7F3"
      />

      <InfoCard
        title="Streak Durumu"
        subtitle="5 gün üst üste başarılı!"
        rightTop="🔥"
        icon="⚡"
        iconBg="#FFD9CB"
      />

      <ProgressBlock
        title="Su Tüketimi"
        valueText="6/8 bardak"
        percent={75}
        color="#7F74B8"
      />

      <ProgressBlock
        title="Adım Hedefi"
        valueText="7,832/10,000"
        percent={78}
        color="#7F74B8"
      />

      <View style={styles.actionGrid}>
        <ActionCard
          title="Öğün Ekle"
          subtitle="Yediğini günlüğe kaydet"
          icon="🍴"
          iconBg="#A8C85A"
          onPress={() => router.push("/nutrition/add-meal")}
        />

        <ActionCard
          title="Egzersiz"
          subtitle="Antrenman başlat"
          icon="⚡"
          iconBg="#F3C96B"
          onPress={() => router.push("/exercise")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120,
    backgroundColor: "#F8F5EE",
    gap: 14,
  },
  topHandle: {
    alignSelf: "center",
    width: 84,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#A8C85A",
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2E2B2B",
  },
  backButton: {
    backgroundColor: "#EEE9F8",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6E63A8",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F4EFE4",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: {
    fontSize: 18,
    color: "#6E63A8",
    fontWeight: "800",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2E2B2B",
    marginBottom: 3,
  },
  infoSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#6F6B66",
  },
  infoRight: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6E63A8",
    marginTop: 2,
  },
  progressBlock: {
    backgroundColor: "#F4EFE4",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E2B2B",
  },
  progressValueText: {
    fontSize: 11,
    color: "#D3A85D",
    fontWeight: "700",
  },
  track: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#DDD9CF",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#F4EFE4",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2E2B2B",
  },
  actionSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#7A7670",
    textAlign: "center",
  },
});