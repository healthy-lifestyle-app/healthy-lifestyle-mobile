import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Dumbbell, Droplets, Flame, TrendingUp, Zap } from 'lucide-react-native';

import { profileApi, type ProfileStatistics, type ProfileOverview } from '@/api/profile';

// ─── Design Tokens ────────────────────────────────────────────

const C = {
  bg: '#F5F8EE',
  card: '#FFFFFF',
  primary: '#A8C85A',
  primaryDark: '#8AAD3F',
  primarySoft: '#EEF5DD',
  text: '#1A2410',
  subtext: '#6B7A5A',
  border: '#DDE8C0',
  separator: '#EBF2D8',
  white: '#FFFFFF',
  orange: '#F27A3D',
  orangeSoft: '#FBE7DD',
  blue: '#5B9BD5',
  blueSoft: '#EAF3FF',
  yellow: '#F0C430',
  yellowSoft: '#FDF6DC',
  purple: '#8B7DC8',
  purpleSoft: '#F0EEFF',
};

// ─── Stat Card ────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
}

function StatCard({ icon, iconBg, label, value, unit, sub }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statCardIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.statCardInfo}>
        <Text style={styles.statCardLabel}>{label}</Text>
        {sub ? <Text style={styles.statCardSub}>{sub}</Text> : null}
      </View>
      <View style={styles.statCardRight}>
        <Text style={styles.statCardValue}>{value}</Text>
        {unit ? <Text style={styles.statCardUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

// ─── Section Title ────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// ─── Empty Chart Placeholder ──────────────────────────────────

function ChartEmpty({ message }: { message: string }) {
  return (
    <View style={styles.chartEmpty}>
      <Text style={styles.chartEmptyText}>{message}</Text>
    </View>
  );
}

function ProgressRow({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  const width = `${Math.max(0, Math.min(percent, 100))}%` as const;

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}
// ─── Helpers ─────────────────────────────────────────────────

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

// ─── Main Screen ──────────────────────────────────────────────

export default function StatisticsScreen() {
  const [stats, setStats] = useState<ProfileStatistics | null>(null);
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, o] = await Promise.all([
        profileApi.getStatistics(),
        profileApi.getOverview(),
      ]);
      setStats(s);
      setOverview(o);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ws = overview?.weeklySummary;
  const averageCalories = safeNum(ws?.averageCalories);
  const calorieTarget = safeNum(ws?.dailyCalorieTarget);
  const caloriePercent = calorieTarget > 0 ? Math.min((averageCalories / calorieTarget) * 100, 100) : 0;
  const waterTarget = safeNum(ws?.waterTargetMl);
  const waterTotal = safeNum(ws?.totalWaterMl);
  const waterPercent = waterTarget > 0 ? Math.min((waterTotal / waterTarget) * 100, 100) : 0;
  const exerciseMinutes = safeNum(ws?.totalExerciseMinutes);
  const activeDays = safeNum(ws?.activeDays);
  const activeDayPercent = Math.min((activeDays / 7) * 100, 100);
  const steps = safeNum(ws?.totalSteps);
  // ─── States ───────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>İstatistikler yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>📊</Text>
          <Text style={styles.errorTitle}>Veriler yüklenemedi</Text>
          <Pressable style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.primaryDark} strokeWidth={2.5} />
          </Pressable>
          <Text style={styles.headerTitle}>İstatistikler</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Streak Cards */}
        <SectionTitle title="Streak" />
        <View style={styles.streakRow}>
          <View style={[styles.streakCard, { backgroundColor: C.orangeSoft }]}>
            <Zap size={28} color={C.orange} fill={C.orange} />
            <Text style={[styles.streakValue, { color: C.orange }]}>
              {safeNum(overview?.streak ?? stats?.currentStreak)}
            </Text>
            <Text style={styles.streakLabel}>Güncel{'\n'}Streak</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: C.purpleSoft }]}>
            <TrendingUp size={28} color={C.purple} strokeWidth={2} />
            <Text style={[styles.streakValue, { color: C.purple }]}>
              {safeNum(stats?.longestStreak)}
            </Text>
            <Text style={styles.streakLabel}>En Uzun{'\n'}Streak</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: C.primarySoft }]}>
            <Dumbbell size={28} color={C.primaryDark} strokeWidth={2} />
            <Text style={[styles.streakValue, { color: C.primaryDark }]}>
              {safeNum(stats?.totalWorkouts)}
            </Text>
            <Text style={styles.streakLabel}>Toplam{'\n'}Antrenman</Text>
          </View>
        </View>

        {/* Weekly Summary Stats */}
        {ws && (
          <>
            <SectionTitle title="Bu Hafta" />
            <View style={styles.statsCard}>
              <StatCard
                icon={<Flame size={18} color="#C9A020" strokeWidth={2} />}
                iconBg={C.yellowSoft}
                label="Ortalama Kalori"
                value={ws.averageCalories}
                unit="kcal"
                sub={ws.dailyCalorieTarget ? `Hedef: ${ws.dailyCalorieTarget} kcal` : undefined}
              />
              <View style={styles.statSep} />
              <StatCard
                icon={<Dumbbell size={18} color={C.primaryDark} strokeWidth={2} />}
                iconBg={C.primarySoft}
                label="Egzersiz"
                value={ws.totalExerciseMinutes}
                unit="dk"
                sub={`${ws.activeDays} aktif gün`}
              />
              <View style={styles.statSep} />
              <StatCard
                icon={<Droplets size={18} color={C.blue} strokeWidth={2} />}
                iconBg={C.blueSoft}
                label="Toplam Su"
                value={(ws.totalWaterMl / 1000).toFixed(1)}
                unit="L"
                sub={ws.waterTargetMl ? `Hedef: ${(ws.waterTargetMl / 1000).toFixed(1)} L/gün` : undefined}
              />
              {ws.totalSteps > 0 && (
                <>
                  <View style={styles.statSep} />
                  <StatCard
                    icon={<TrendingUp size={18} color={C.purple} strokeWidth={2} />}
                    iconBg={C.purpleSoft}
                    label="Toplam Adım"
                    value={ws.totalSteps.toLocaleString('tr-TR')}
                  />
                </>
              )}
            </View>
          </>
        )}

        {/* Calorie Progress */}
        <SectionTitle title="Kalori Karşılaştırması" />
        <View style={styles.chartCard}>
          {averageCalories > 0 || calorieTarget > 0 ? (
            <View style={styles.progressGroup}>
              <ProgressRow
                label="Ortalama Kalori"
                value={`${averageCalories} kcal`}
                percent={calorieTarget > 0 ? caloriePercent : 100}
                color={C.primary}
              />
              <ProgressRow
                label="Hedef Kalori"
                value={calorieTarget > 0 ? `${calorieTarget} kcal` : 'Henüz yok'}
                percent={calorieTarget > 0 ? 100 : 0}
                color={C.border}
              />
            </View>
          ) : (
            <ChartEmpty message="Kalori verisi henüz yok" />
          )}
        </View>

        {/* Activity Summary */}
        <SectionTitle title="Haftalık Aktivite Özeti" />
        <View style={styles.chartCard}>
          {exerciseMinutes > 0 || activeDays > 0 || waterTotal > 0 || steps > 0 ? (
            <View style={styles.progressGroup}>
              <ProgressRow
                label="Egzersiz Süresi"
                value={`${exerciseMinutes} dk`}
                percent={Math.min((exerciseMinutes / 150) * 100, 100)}
                color={C.primary}
              />
              <ProgressRow
                label="Aktif Gün"
                value={`${activeDays}/7 gün`}
                percent={activeDayPercent}
                color={C.orange}
              />
              <ProgressRow
                label="Toplam Su"
                value={`${(waterTotal / 1000).toFixed(1)} L`}
                percent={waterTarget > 0 ? waterPercent : Math.min((waterTotal / 14000) * 100, 100)}
                color={C.blue}
              />
              {steps > 0 ? (
                <ProgressRow
                  label="Toplam Adım"
                  value={steps.toLocaleString('tr-TR')}
                  percent={Math.min((steps / 70000) * 100, 100)}
                  color={C.purple}
                />
              ) : null}
            </View>
          ) : (
            <ChartEmpty message="Aktivite verisi henüz yok" />
          )}
        </View>
        {/* Extra stats from backend if present */}
        {stats && stats.totalCaloriesBurned != null && (
          <>
            <SectionTitle title="Genel Toplam" />
            <View style={styles.statsCard}>
              {stats.totalCaloriesBurned != null && (
                <StatCard
                  icon={<Flame size={18} color="#C9A020" strokeWidth={2} />}
                  iconBg={C.yellowSoft}
                  label="Toplam Yakılan Kalori"
                  value={safeNum(stats.totalCaloriesBurned).toLocaleString('tr-TR')}
                  unit="kcal"
                />
              )}
              {stats.totalWaterMl != null && (
                <>
                  <View style={styles.statSep} />
                  <StatCard
                    icon={<Droplets size={18} color={C.blue} strokeWidth={2} />}
                    iconBg={C.blueSoft}
                    label="Toplam Su"
                    value={(safeNum(stats.totalWaterMl) / 1000).toFixed(1)}
                    unit="L"
                  />
                </>
              )}
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 12, fontSize: 15, color: C.subtext },
  errorEmoji: { fontSize: 44, marginBottom: 12 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  retryBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },

  header: {
    marginTop: 8,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginBottom: 14,
  },

  streakRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  streakCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  streakValue: { fontSize: 28, fontWeight: '800' },
  streakLabel: { fontSize: 11, color: C.subtext, textAlign: 'center', fontWeight: '600' },

  statsCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    gap: 12,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardInfo: { flex: 1 },
  statCardLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  statCardSub: { fontSize: 12, color: C.subtext, marginTop: 2 },
  statCardRight: { alignItems: 'flex-end' },
  statCardValue: { fontSize: 18, fontWeight: '800', color: C.primaryDark },
  statCardUnit: { fontSize: 11, color: C.subtext, marginTop: 2 },
  statSep: { height: 1, backgroundColor: C.separator },

  chartCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
    overflow: 'hidden',
    padding: 16,
  },
  progressGroup: { gap: 16 },
  progressRow: { gap: 8 },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  progressValue: { fontSize: 13, fontWeight: '700', color: C.subtext },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: C.separator,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },
  chartEmpty: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartEmptyText: { fontSize: 14, color: C.subtext },
});