import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Screen from '@/components/Screen';

type OnboardingProfile = {
  name?: string;
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  goals?: string[];
};

const moods = [
  {
    key: "sad",
    icon: "☹",
    color: "#C9C3E8",
    message:
      "Bugün biraz düşük hissediyor olabilirsin. Küçük bir başlangıç bile yeterli 🌿",
  },
  {
    key: "calm",
    icon: "☺",
    color: "#E8DDC8",
    message: "Sakin bir gündesin. Dengeli ilerlemek için güzel bir zaman 🤍",
  },
  {
    key: "good",
    icon: "😊",
    color: "#A8C85A",
    message:
      "Harika gidiyorsun! Bu pozitif enerjiyi koru ve gününü dolu dolu yaşa ✨",
  },
  {
    key: "okay",
    icon: "😌",
    color: "#C9C3E8",
    message:
      "Bugün dengeli görünüyorsun. Küçük ama düzenli adımlar seni ileri taşır 💪",
  },
  {
    key: "hot",
    icon: "🥵",
    color: "#F59A6B",
    message:
      "Biraz yorgun hissedebilirsin. Kendine nazik davran ve tempoyu dengeli tut 🌸",
  },
];

function CircleStat({
  value,
  label,
  ringColor,
}: {
  value: string;
  label: string;
  ringColor: string;
}) {
  return (
    <View style={styles.circleWrap}>
      <View style={[styles.circleOuter, { borderColor: ringColor }]}>
        <View style={styles.circleInner}>
          <Text style={styles.circleValue}>{value}</Text>
          <Text style={styles.circleLabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

function SmallMetric({
  icon,
  iconBg,
  title,
  value,
}: {
  icon: string;
  iconBg: string;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.smallMetricCard}>
      <View style={[styles.smallMetricIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.smallMetricIconText}>{icon}</Text>
      </View>

      <View>
        <Text style={styles.smallMetricTitle}>{title}</Text>
        <Text style={styles.smallMetricValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [waterGlasses] = useState<number>(6);

  const steps = 7832;
  const exerciseMinutes = 30;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const raw = await AsyncStorage.getItem("onboarding_profile");
        if (raw) {
          setProfile(JSON.parse(raw));
        }
      } catch (error) {
        console.log("Profil okunamadı:", error);
      }
    };

    loadProfile();
  }, []);

  const userName = profile?.name?.trim() || "İsim";

  const weightGoalKg = 8;
  const currentLostKg = 4.2;

  const goalPercent = useMemo(() => {
    return Math.min((currentLostKg / weightGoalKg) * 100, 100);
  }, []);

  return (
    <Screen backgroundColor="#F8F5EE" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
      >
        <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Merhaba, {userName}!</Text>
            <Text style={styles.subGreeting}>
              Bugün kendini nasıl hissediyorsun?
            </Text>
          </View>

          <Pressable
            style={styles.avatarButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.avatarText}>👤</Text>
          </Pressable>
        </View>

        <View style={styles.moodRow}>
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.key;

            return (
              <Pressable
                key={mood.key}
                onPress={() =>
                  setSelectedMood((prev) =>
                    prev === mood.key ? null : mood.key
                  )
                }
                style={[
                  styles.moodButton,
                  {
                    borderColor: isSelected ? mood.color : "#E6E2D8",
                    backgroundColor: isSelected ? mood.color : "#F8F5EE",
                  },
                ]}
              >
                <Text style={styles.moodIcon}>{mood.icon}</Text>
              </Pressable>
            );
          })}
        </View>

        {selectedMood ? (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              {moods.find((mood) => mood.key === selectedMood)?.message}
            </Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <CircleStat value="1,920" label="kcal" ringColor="#9DB65A" />
          <CircleStat value="7,832" label="adım" ringColor="#C8C4E8" />
        </View>

        <View style={styles.metricsRow}>
          <SmallMetric
            icon="💧"
            iconBg="#F7E9C8"
            title="Su"
            value={`${waterGlasses}/8 bardak`}
          />
          <SmallMetric
            icon="⚡"
            iconBg="#FFD8C7"
            title="Egzersiz"
            value={`${exerciseMinutes} dk`}
          />
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>〰</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.progressTitle}>Harika İlerleme! 🎉</Text>
              <Text style={styles.progressSubtitle}>
                Son 2 ayda 4.2 kg kaybettin
              </Text>
            </View>
          </View>

          <View style={styles.weightInfoBox}>
            <View>
              <Text style={styles.weightMain}>4.2 kg = 16 paket margarin</Text>
              <Text style={styles.weightSub}>artık vücudunda değil!</Text>
            </View>

            <Text style={styles.weightGreen}>-4.2{"\n"}kg</Text>
          </View>

          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Hedef: 8 kg</Text>
            <Text style={styles.goalPercent}>
              %{goalPercent.toFixed(1)} tamamlandı
            </Text>
          </View>

          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${goalPercent}%` }]} />
          </View>

          <Text style={styles.remainingText}>Kalan: 3.8 kg</Text>
        </View>

        <View style={styles.actionSection}>
          <View style={styles.topActionRow}>
            <Pressable
              style={[styles.smallActionCard, styles.mealCard]}
              onPress={() => router.push("/nutrition/add-meal")}
            >
              <View
                style={[styles.actionIconWrap, { backgroundColor: "#A8C85A" }]}
              >
                <Text style={styles.actionIcon}>🍽</Text>
              </View>
              <Text style={styles.actionTitle}>Öğün Ekle</Text>
              <Text style={styles.actionSub}>Yediğin öğünü kaydet</Text>
            </Pressable>

            <Pressable
              style={[styles.smallActionCard, styles.exerciseCardSmall]}
              onPress={() => router.push("/exercise")}
            >
              <View
                style={[styles.actionIconWrap, { backgroundColor: "#F3C96B" }]}
              >
                <Text style={styles.actionIcon}>〰</Text>
              </View>
              <Text style={styles.actionTitle}>Egzersiz</Text>
              <Text style={styles.actionSub}>Antrenman başlat</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.scanActionCard}
            onPress={() => router.push("/nutrition/scan")}
          >
            <View
              style={[styles.actionIconWrap, { backgroundColor: "#7F74AE" }]}
            >
              <Text style={[styles.actionIcon, { color: "#FFFFFF" }]}>⌘</Text>
            </View>
            <Text style={styles.scanActionTitle}>Ürün Tara</Text>
            <Text style={styles.scanActionSub}>AI ile analiz et</Text>
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 140,
    backgroundColor: "#F8F5EE",
  },
 content: {
  flex: 1,
  gap: 14,
},
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E2B2B",
  },
  subGreeting: {
    marginTop: 6,
    fontSize: 12,
    color: "#6F6B66",
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#C8BEE2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  moodButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  moodIcon: {
    fontSize: 13,
  },
  messageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EFE1D9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "85%",
  },
  messageText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#544B46",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 2,
  },
  circleWrap: {
    flex: 1,
    alignItems: "center",
  },
  circleOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5EE",
  },
  circleInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E2B2B",
  },
  circleLabel: {
    fontSize: 11,
    color: "#7A7670",
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  smallMetricCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4EFE4",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  smallMetricIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  smallMetricIconText: {
    fontSize: 13,
  },
  smallMetricTitle: {
    fontSize: 11,
    color: "#5E5A56",
  },
  smallMetricValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E2B2B",
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: "#DCE3C8",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#C9D2AE",
  },
  progressHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  progressBadge: {
    
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#9CB45A",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBadgeText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2E2B2B",
  },
  progressSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#5F5A55",
  },
  weightInfoBox: {
    backgroundColor: "#F5F0E8",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightMain: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2E2B2B",
  },
  weightSub: {
    fontSize: 11,
    color: "#6F6B66",
    marginTop: 3,
  },
  weightGreen: {
    textAlign: "right",
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
    color: "#87A63E",
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalLabel: {
    fontSize: 11,
    color: "#5F5A55",
  },
  goalPercent: {
    fontSize: 11,
    color: "#87A63E",
    fontWeight: "700",
  },
  goalTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EEF1E2",
    overflow: "hidden",
  },
  goalFill: {
    height: "100%",
    backgroundColor: "#9CB45A",
    borderRadius: 999,
  },
  remainingText: {
    fontSize: 10,
    color: "#6D6A65",
    textAlign: "center",
  },

  actionSection: {
  gap: 14,
  flex: 1,
},
  topActionRow: {
  flexDirection: "row",
  gap: 12,
},
  smallActionCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 142,
    borderWidth: 1,
  },
  mealCard: {
    backgroundColor: "#EEF2E8",
    borderColor: "#C8D8BE",
  },
  exerciseCardSmall: {
    backgroundColor: "#F7F0DF",
    borderColor: "#EFCF8B",
  },
 scanActionCard: {
  width: "100%",
  flex: 1,
  borderRadius: 26,
  paddingHorizontal: 18,
  paddingTop: 28,
  paddingBottom: 38,
  minHeight: 300,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#ECE8F8",
  borderWidth: 1,
  borderColor: "#D4CDED",
},
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  actionIcon: {
    fontSize: 17,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2E2B2B",
    textAlign: "center",
  },
  actionSub: {
    fontSize: 12,
    color: "#7A7670",
    marginTop: 8,
    textAlign: "center",
  },
  scanActionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E2B2B",
    textAlign: "center",
  },
  scanActionSub: {
    fontSize: 13,
    color: "#7A7670",
    marginTop: 10,
    textAlign: "center",
  },
}); 