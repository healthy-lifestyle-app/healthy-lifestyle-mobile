import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Beef,
  Droplets,
  Flame,
  Scale,
  Target,
  Wheat,
  Zap,
} from 'lucide-react-native';

import { profileApi, type ProfileGoals } from '@/api/profile';

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
  danger: '#E25555',
};

const GOAL_TYPES = [
  { value: 'LOSE_WEIGHT', label: 'Kilo Ver', emoji: '📉' },
  { value: 'MAINTAIN', label: 'Koruma', emoji: '⚖️' },
  { value: 'GAIN_MUSCLE', label: 'Kas Kazan', emoji: '💪' },
  { value: 'IMPROVE_FITNESS', label: 'Form Geliştir', emoji: '🏃' },
];

const ACTIVITY_LEVELS = [
  { value: 'SEDENTARY', label: 'Hareketsiz', desc: 'Masa başı iş, spor yok' },
  { value: 'LIGHTLY_ACTIVE', label: 'Az Aktif', desc: 'Haftada 1-3 gün spor' },
  { value: 'MODERATELY_ACTIVE', label: 'Orta Aktif', desc: 'Haftada 3-5 gün spor' },
  { value: 'VERY_ACTIVE', label: 'Çok Aktif', desc: 'Haftada 6-7 gün yoğun' },
  { value: 'EXTRA_ACTIVE', label: 'Aşırı Aktif', desc: 'Günde 2x antrenman' },
];

const mapGoalTypeFromBackend = (value?: string | null) => {
  if (value === 'lose') return ['LOSE_WEIGHT'];
  if (value === 'maintain') return ['MAINTAIN'];
  if (value === 'gain') return ['GAIN_MUSCLE'];

  if (
    value === 'LOSE_WEIGHT' ||
    value === 'MAINTAIN' ||
    value === 'GAIN_MUSCLE' ||
    value === 'IMPROVE_FITNESS'
  ) {
    return [value];
  }

  return [];
};

const mapGoalsToBackendGoalType = (values: string[]) => {
  if (values.includes('LOSE_WEIGHT')) return 'lose';
  if (values.includes('GAIN_MUSCLE')) return 'gain';
  if (values.includes('MAINTAIN') || values.includes('IMPROVE_FITNESS')) {
    return 'maintain';
  }

  return null;
};

const mapActivityLevelToBackend = (value: string | null) => {
  if (value === 'SEDENTARY') return 'low';
  if (value === 'LIGHTLY_ACTIVE') return 'low';
  if (value === 'MODERATELY_ACTIVE') return 'medium';
  if (value === 'VERY_ACTIVE') return 'high';
  if (value === 'EXTRA_ACTIVE') return 'high';

  if (value === 'low' || value === 'medium' || value === 'high') return value;

  return null;
};

const mapActivityLevelFromBackend = (value?: string | null) => {
  if (value === 'low') return 'LIGHTLY_ACTIVE';
  if (value === 'medium') return 'MODERATELY_ACTIVE';
  if (value === 'high') return 'VERY_ACTIVE';

  if (
    value === 'SEDENTARY' ||
    value === 'LIGHTLY_ACTIVE' ||
    value === 'MODERATELY_ACTIVE' ||
    value === 'VERY_ACTIVE' ||
    value === 'EXTRA_ACTIVE'
  ) {
    return value;
  }

  return null;
};

const parseNumberOrNull = (value: string) => {
  const cleaned = value.replace(',', '.').trim();

  if (!cleaned) return null;

  const parsed = Number(cleaned);

  return Number.isNaN(parsed) ? null : parsed;
};

function GoalInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <View style={styles.goalInputRow}>
      <View style={[styles.goalInputIcon, { backgroundColor: iconBg }]}>
        {icon}
      </View>

      <View style={styles.goalInputMiddle}>
        <Text style={styles.goalInputLabel}>{label}</Text>
      </View>

      <View style={styles.goalInputRight}>
        <TextInput
          style={styles.goalInputField}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={C.subtext}
          keyboardType="decimal-pad"
        />
        <Text style={styles.goalInputUnit}>{unit}</Text>
      </View>
    </View>
  );
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<ProfileGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const [selectedGoalTypes, setSelectedGoalTypes] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);

  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState('');
  const [dailyProteinTarget, setDailyProteinTarget] = useState('');
  const [dailyCarbsTarget, setDailyCarbsTarget] = useState('');
  const [dailyFatTarget, setDailyFatTarget] = useState('');
  const [waterTargetMl, setWaterTargetMl] = useState('');

  const populate = useCallback((g: ProfileGoals) => {
    setGoals(g);
    setSelectedGoalTypes(mapGoalTypeFromBackend(g.goalType));
    setActivityLevel(mapActivityLevelFromBackend(g.activityLevel));

    setTargetWeightKg(g.targetWeightKg?.toString() ?? '');
    setDailyCalorieTarget(g.dailyCalorieTarget?.toString() ?? '');
    setDailyProteinTarget(g.dailyProteinTarget?.toString() ?? '');
    setDailyCarbsTarget(g.dailyCarbsTarget?.toString() ?? '');
    setDailyFatTarget(g.dailyFatTarget?.toString() ?? '');
    setWaterTargetMl(g.waterTargetMl ? (g.waterTargetMl / 1000).toString() : '');
  }, []);

  useEffect(() => {
    profileApi
      .getGoals()
      .then(populate)
      .catch((err) => {
        console.log('GET_GOALS_ERROR', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [populate]);

  const toggleGoalType = (value: string) => {
    setSelectedGoalTypes((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }

      return [...prev, value];
    });
  };

  const handleSave = async () => {
    const backendGoalType = mapGoalsToBackendGoalType(selectedGoalTypes);
    const backendActivityLevel = mapActivityLevelToBackend(activityLevel);

    if (!backendGoalType || !backendActivityLevel) {
      Alert.alert('Eksik bilgi', 'Lütfen en az bir hedef ve aktivite seviyesi seçin.');
      return;
    }

    setSaving(true);

    try {
      const updated = await profileApi.updateGoals({
        goalType: backendGoalType,
        activityLevel: backendActivityLevel,
        targetWeightKg: parseNumberOrNull(targetWeightKg),
        dailyCalorieTarget: parseNumberOrNull(dailyCalorieTarget),
        dailyProteinTarget: parseNumberOrNull(dailyProteinTarget),
        dailyCarbsTarget: parseNumberOrNull(dailyCarbsTarget),
        dailyFatTarget: parseNumberOrNull(dailyFatTarget),
        waterTargetMl: waterTargetMl
          ? Math.round((parseNumberOrNull(waterTargetMl) ?? 0) * 1000)
          : null,
      });

     populate(updated);

router.replace('/(tabs)/profile');
    } catch (err) {
      console.log('UPDATE_GOALS_ERROR', err);
      Alert.alert('Hata', 'Hedefler kaydedilemedi. Tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Hedefler yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Yüklenemedi</Text>
          <Pressable style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Geri Dön</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const willRecalculate =
    mapGoalsToBackendGoalType(selectedGoalTypes) !== goals?.goalType ||
    mapActivityLevelToBackend(activityLevel) !== goals?.activityLevel;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.primaryDark} strokeWidth={2.5} />
          </Pressable>
          <Text style={styles.headerTitle}>Hedeflerim</Text>
          <View style={{ width: 44 }} />
        </View>

        {willRecalculate && (
          <View style={styles.recalcBanner}>
            <Text style={styles.recalcBannerText}>
              ⚡ Hedef türü veya aktivite seviyesi değişti — kaydedince kalori ve
              makro hedeflerin otomatik güncellenecek.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Hedef Türü</Text>
        <View style={styles.chipGrid}>
          {GOAL_TYPES.map((g) => {
            const isSelected = selectedGoalTypes.includes(g.value);

            return (
              <Pressable
                key={g.value}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => toggleGoalType(g.value)}>
                <Text style={styles.chipEmoji}>{g.emoji}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    isSelected && styles.chipLabelActive,
                  ]}>
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Aktivite Seviyesi</Text>
        <View style={styles.activityList}>
          {ACTIVITY_LEVELS.map((a) => (
            <Pressable
              key={a.value}
              style={[
                styles.activityItem,
                activityLevel === a.value && styles.activityItemActive,
              ]}
              onPress={() => setActivityLevel(a.value)}>
              <View style={styles.activityRadio}>
                {activityLevel === a.value && (
                  <View style={styles.activityRadioFill} />
                )}
              </View>

              <View style={styles.activityInfo}>
                <Text
                  style={[
                    styles.activityLabel,
                    activityLevel === a.value && styles.activityLabelActive,
                  ]}>
                  {a.label}
                </Text>
                <Text style={styles.activityDesc}>{a.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Günlük Hedefler</Text>
        <Text style={styles.sectionSubtitle}>
          Boş bırakırsanız backend otomatik hesaplar.
        </Text>

        <View style={styles.inputCard}>
          <GoalInput
            label="Kalori"
            value={dailyCalorieTarget}
            onChange={setDailyCalorieTarget}
            unit="kcal"
            placeholder="Otomatik"
            icon={<Flame size={18} color="#C9A020" strokeWidth={2} />}
            iconBg="#FDF6DC"
          />

          <View style={styles.inputSep} />

          <GoalInput
            label="Protein"
            value={dailyProteinTarget}
            onChange={setDailyProteinTarget}
            unit="g"
            placeholder="Otomatik"
            icon={<Beef size={18} color={C.primaryDark} strokeWidth={2} />}
            iconBg={C.primarySoft}
          />

          <View style={styles.inputSep} />

          <GoalInput
            label="Karbonhidrat"
            value={dailyCarbsTarget}
            onChange={setDailyCarbsTarget}
            unit="g"
            placeholder="Otomatik"
            icon={<Wheat size={18} color="#D45C1E" strokeWidth={2} />}
            iconBg="#FBEDEA"
          />

          <View style={styles.inputSep} />

          <GoalInput
            label="Yağ"
            value={dailyFatTarget}
            onChange={setDailyFatTarget}
            unit="g"
            placeholder="Otomatik"
            icon={<Zap size={18} color="#8B7DC8" strokeWidth={2} />}
            iconBg="#F0EEFF"
          />

          <View style={styles.inputSep} />

          <GoalInput
            label="Su"
            value={waterTargetMl}
            onChange={setWaterTargetMl}
            unit="L"
            placeholder="2.5"
            icon={<Droplets size={18} color="#4A8BC4" strokeWidth={2} />}
            iconBg="#EAF3FF"
          />

          <View style={styles.inputSep} />

          <GoalInput
            label="Hedef Kilo"
            value={targetWeightKg}
            onChange={setTargetWeightKg}
            unit="kg"
            placeholder="70"
            icon={<Scale size={18} color="#E27A3D" strokeWidth={2} />}
            iconBg="#FBE7DD"
          />
        </View>

        <Pressable
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <>
              <Target size={20} color={C.white} strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>Hedefleri Kaydet</Text>
            </>
          )}
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginBottom: 20,
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

  recalcBanner: {
    backgroundColor: '#EAF3FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C5DCEF',
  },
  recalcBannerText: { fontSize: 13, color: '#3A6E9C', lineHeight: 18 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: C.subtext,
    marginBottom: 14,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    flex: 1,
    minWidth: '44%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  chipActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  chipEmoji: { fontSize: 24 },
  chipLabel: { fontSize: 14, fontWeight: '700', color: C.subtext },
  chipLabelActive: { color: C.primaryDark },

  activityList: { gap: 10, marginBottom: 28 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16,
  },
  activityItemActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  activityRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityRadioFill: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: C.primary,
  },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 15, fontWeight: '700', color: C.subtext },
  activityLabelActive: { color: C.primaryDark },
  activityDesc: { fontSize: 12, color: C.subtext, marginTop: 2 },

  inputCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    gap: 12,
  },
  goalInputIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInputMiddle: { flex: 1 },
  goalInputLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  goalInputRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalInputField: {
    width: 90,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '700',
    color: C.primaryDark,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: C.bg,
  },
  goalInputUnit: { fontSize: 13, fontWeight: '600', color: C.subtext, width: 36 },
  inputSep: { height: 1, backgroundColor: C.separator },

  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveBtnText: { color: C.white, fontSize: 17, fontWeight: '800' },
});