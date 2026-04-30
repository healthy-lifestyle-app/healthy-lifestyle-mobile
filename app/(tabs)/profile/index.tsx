import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Droplets,
  Edit3,
  Flame,
  Lock,
  LogOut,
  Settings,
  Star,
  Target,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from 'lucide-react-native';

import { useAuth } from '@/context/AuthContext';
import {
  profileApi,
  type ProfileGoals,
  type ProfileHistory,
  type ProfileOverview,
  type ProfileSettings,
  type ProfileStatistics,
} from '@/api/profile';

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
  white: '#FFFFFF',
  danger: '#E25555',
  dangerSoft: '#FDEAEA',
  orange: '#F27A3D',
  orangeSoft: '#FBE7DD',
  blue: '#5B9BD5',
  blueSoft: '#EAF3FF',
  purple: '#8B7DC8',
  purpleSoft: '#F0EEFF',
  yellow: '#F0C430',
  yellowSoft: '#FDF6DC',
  separator: '#EBF2D8',
};

// ─── Helpers ─────────────────────────────────────────────────
const getGoalLabel = (value?: string | null) => {
  if (value === 'lose') return 'Kilo Ver';
  if (value === 'maintain') return 'Koruma';
  if (value === 'gain') return 'Kas Kazan';

  return 'Hedef belirlenmedi';
};
const GENDER_LABELS: Record<string, string> = {
  male: 'Erkek',
  female: 'Kadın',
  other: 'Diğer',
  MALE: 'Erkek',
  FEMALE: 'Kadın',
  OTHER: 'Diğer',
};

function calcAge(birthDate: string | null | undefined): string | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const age = Math.floor(
    (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
  return `${age} yaş`;
}

// ─── Loading / Error screens ──────────────────────────────────

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.stateText}>Profil yükleniyor…</Text>
      </View>
    </SafeAreaView>
  );
}

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centeredState}>
        <Text style={styles.stateEmoji}>😕</Text>
        <Text style={styles.stateTitle}>Bir sorun oluştu</Text>
        <Text style={styles.stateText}>Veriler yüklenemedi.</Text>
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>Tekrar Dene</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Incomplete Profile Banner ────────────────────────────────

function IncompleteProfileBanner({
  settings,
  goals,
  onFill,
}: {
  settings: ProfileSettings;
  goals: ProfileGoals | null;
  onFill: () => void;
}) {
  const missing: string[] = [];
  if (!settings.heightCm) missing.push('boy');
  if (!settings.weightKg) missing.push('kilo');
  if (!settings.gender) missing.push('cinsiyet');
  if (!settings.birthDate) missing.push('doğum tarihi');
  if (!goals?.goalType) missing.push('hedef türü');
  if (!goals?.activityLevel) missing.push('aktivite seviyesi');
  if (missing.length === 0) return null;

  return (
    <Pressable style={styles.incompleteBanner} onPress={onFill}>
      <View style={styles.incompleteBannerLeft}>
        <Text style={styles.incompleteBannerEmoji}>📝</Text>
        <View>
          <Text style={styles.incompleteBannerTitle}>Profilini tamamla</Text>
          <Text style={styles.incompleteBannerDesc}>Eksik: {missing.join(', ')}</Text>
        </View>
      </View>
      <ChevronRight size={18} color={C.primaryDark} strokeWidth={2.5} />
    </Pressable>
  );
}

// ─── Summary Card ─────────────────────────────────────────────

function SummaryCard({
  value,
  target,
  label,
  bg,
  valueColor,
  progress,
}: {
  value: string | number;
  target?: string | number | null;
  label: string;
  bg: string;
  valueColor: string;
  progress: number;
}) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
      {target != null && <Text style={styles.summaryTarget}>/ {target}</Text>}
      <Text style={styles.summaryLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(p * 100)}%`, backgroundColor: valueColor },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Goal Chip ────────────────────────────────────────────────

function GoalChip({
  label,
  value,
  unit,
  color,
  softColor,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  color: string;
  softColor: string;
}) {
  return (
    <View style={[styles.goalChip, { backgroundColor: softColor }]}>
      <Text style={[styles.goalChipValue, { color }]}>
        {value != null ? `${value}${unit ? ` ${unit}` : ''}` : '—'}
      </Text>
      <Text style={styles.goalChipLabel}>{label}</Text>
    </View>
  );
}

// ─── Menu Item ────────────────────────────────────────────────

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  right,
  rightNode,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  rightNode?: React.ReactNode;
  danger?: boolean;
}) {
  const rightContent = right ?? rightNode;

  return (
    <Pressable
  style={({ pressed }) => [
    styles.menuItem,
    pressed && { opacity: 0.6 },
  ]}
  onPress={() => {
    console.log('MENU_ITEM_PRESSED:', title);
    onPress?.();
  }}
  hitSlop={10}
>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
          {icon}
        </View>

        <View>
          <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {rightContent ?? <Text style={styles.menuArrow}>›</Text>}
    </Pressable>
  );
}

// ─── Edit Settings Modal ──────────────────────────────────────
// Onboarding'den gelen tüm alanları içerir:
// fullName, gender, birthDate, heightCm, weightKg, targetWeightKg
const mapGenderToBackend = (value: string | null) => {
  if (value === 'MALE') return 'male';
  if (value === 'FEMALE') return 'female';
  if (value === 'OTHER') return 'other';

  if (value === 'male' || value === 'female' || value === 'other') return value;

  return undefined;
};

const mapGenderFromBackend = (value?: string | null) => {
  if (value === 'male') return 'MALE';
  if (value === 'female') return 'FEMALE';
  if (value === 'other') return 'OTHER';

  if (value === 'MALE' || value === 'FEMALE' || value === 'OTHER') return value;

  return null;
};
const GENDER_OPTIONS = [
  { value: 'MALE' as const, label: 'Erkek' },
  { value: 'FEMALE' as const, label: 'Kadın' },
  { value: 'OTHER' as const, label: 'Diğer' },
];

function EditSettingsModal({
  visible,
  settings,
  onClose,
  onSave,
}: {
  visible: boolean;
  settings: ProfileSettings;
  onClose: () => void;
  onSave: (data: Partial<ProfileSettings>) => Promise<void>;
}) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setFullName(settings.fullName ?? '');
      setGender(mapGenderFromBackend(settings.gender));
      setBirthDate(settings.birthDate ? settings.birthDate.slice(0, 10) : '');
      setHeightCm(settings.heightCm?.toString() ?? '');
      setWeightKg(settings.weightKg?.toString() ?? '');
      setTargetWeightKg(settings.targetWeightKg?.toString() ?? '');
    }
  }, [visible, settings]);

  const toNumberOrUndefined = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed.replace(',', '.'));

    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleSave = async () => {
    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      Alert.alert('Hata', 'Doğum tarihi YYYY-AA-GG formatında olmalı.\nÖrnek: 1990-05-14');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        fullName: fullName.trim() || undefined,
        gender: mapGenderToBackend(gender),
        birthDate: birthDate || undefined,
        heightCm: toNumberOrUndefined(heightCm),
        weightKg: toNumberOrUndefined(weightKg),
        targetWeightKg: toNumberOrUndefined(targetWeightKg),
      });

      onClose();
    } catch (error) {
      console.log('PROFILE_SETTINGS_SAVE_ERROR', error);
      Alert.alert('Hata', 'Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <ScrollView
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profil Düzenle</Text>
              <Pressable onPress={onClose} style={styles.modalClose}>
                <X size={20} color={C.subtext} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ad Soyad"
              placeholderTextColor={C.subtext}
            />

            <Text style={styles.inputLabel}>Cinsiyet</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((g) => (
                <Pressable
                  key={g.value}
                  style={[
                    styles.genderChip,
                    gender === g.value && styles.genderChipActive,
                  ]}
                  onPress={() => setGender(g.value)}>
                  <Text
                    style={[
                      styles.genderChipText,
                      gender === g.value && styles.genderChipTextActive,
                    ]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Doğum Tarihi (YYYY-AA-GG)</Text>
            <TextInput
              style={styles.textInput}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="1990-05-14"
              placeholderTextColor={C.subtext}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />

            <Text style={styles.inputLabel}>Boy (cm)</Text>
            <TextInput
              style={styles.textInput}
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="170"
              placeholderTextColor={C.subtext}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Kilo (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="70"
              placeholderTextColor={C.subtext}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Hedef Kilo (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={targetWeightKg}
              onChangeText={setTargetWeightKg}
              placeholder="65"
              placeholderTextColor={C.subtext}
              keyboardType="decimal-pad"
            />

            <Pressable
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Kaydet</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────

function ChangePasswordModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
  currentPassword: string;
  newPassword: string;
}) => Promise<void>;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  const handleSave = async () => {
    if (next !== confirm) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
      return;
    }
    if (next.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalı.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
  currentPassword: current,
  newPassword: next,
});
      reset();
      onClose();
      Alert.alert('Başarılı', 'Şifreniz güncellendi.');
    } catch {
      Alert.alert('Hata', 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Şifre Değiştir</Text>
            <Pressable
              onPress={() => {
                reset();
                onClose();
              }}
              style={styles.modalClose}>
              <X size={20} color={C.subtext} />
            </Pressable>
          </View>

          {(['Mevcut Şifre', 'Yeni Şifre', 'Yeni Şifre Tekrar'] as const).map((label, i) => (
            <View key={label}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                style={styles.textInput}
                value={[current, next, confirm][i]}
                onChangeText={[setCurrent, setNext, setConfirm][i]}
                placeholder="••••••"
                placeholderTextColor={C.subtext}
                secureTextEntry
              />
            </View>
          ))}

          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Güncelle</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [goals, setGoals] = useState<ProfileGoals | null>(null);
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null);
  const [history, setHistory] = useState<ProfileHistory | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editSettingsVisible, setEditSettingsVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

 const fetchAll = useCallback(async () => {
  try {
    setError(false);

    const [ov, st, gl, stats, hist] = await Promise.all([
      profileApi.getOverview(),
      profileApi.getSettings(),
      profileApi.getGoals(),
      profileApi.getStatistics(),
      profileApi.getHistory(),
    ]);

    setOverview(ov);
    setSettings(st);
    setGoals(gl);
    setStatistics(stats);
    setHistory(hist);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
  } catch (err) {
    console.log('PROFILE_FETCH_ALL_ERROR', err);
    setError(true);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [fadeAnim]);

  useFocusEffect(
  useCallback(() => {
    fetchAll();
  }, [fetchAll]),
);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  const handleSaveSettings = async (data: Partial<ProfileSettings>) => {
    await profileApi.updateSettings(data);
    await fetchAll();
  };

  const handleSavePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  //console.log('PASSWORD_UPDATE_PAYLOAD', data);
  await profileApi.updatePassword(data);
};

  const handleToggleNotifications = async (value: boolean) => {
    if (!settings) return;
    try {
      await profileApi.updateNotifications({ notificationsEnabled: value });
      setSettings({ ...settings, notificationsEnabled: value });
    } catch {
      Alert.alert('Hata', 'Bildirim ayarı güncellenemedi.');
    }
  };

  const handleLogout = async () => {
  console.log('LOGOUT_CLICKED');

  try {
    console.log('SIGN_OUT_START');
    await signOut();
    console.log('SIGN_OUT_DONE');

    router.replace('/auth/login');
  } catch (err) {
    console.log('LOGOUT_ERROR', err);
    Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
  }
};

  if (loading) return <LoadingScreen />;
  if (error)
    return (
      <ErrorScreen
        onRetry={() => {
          setLoading(true);
          fetchAll();
        }}
      />
    );

  // ─── Derived values ────────────────────────────────────────

  const displayName =
    overview?.user?.fullName?.trim() ||
    (user as any)?.fullName?.trim() ||
    (user as any)?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'Kullanıcı';

  const email =
    overview?.user?.email ??
    settings?.email ??
    (user as any)?.email ??
    '-';

  const streak = overview?.streak ?? 0;
  const ws = overview?.weeklySummary;

  const calorieProgress =
    ws?.dailyCalorieTarget && ws.dailyCalorieTarget > 0
      ? ws.averageCalories / ws.dailyCalorieTarget
      : ws?.averageCalories
      ? 0.6
      : 0;

  const waterLiters = ws ? (ws.totalWaterMl / 7000).toFixed(1) : '0';
  const waterTarget = goals?.waterTargetMl
    ? (goals.waterTargetMl / 1000).toFixed(0)
    : null;
  const waterProgress =
    goals?.waterTargetMl && ws
      ? ws.totalWaterMl / (goals.waterTargetMl * 7)
      : 0.5;

  const exerciseTarget = 300;
  const exerciseProgress = ws
    ? Math.min(1, ws.totalExerciseMinutes / exerciseTarget)
    : 0;

  const ageLabel = calcAge(settings?.birthDate);
  const genderLabel = settings?.gender ? GENDER_LABELS[settings.gender] ?? null : null;

  const profileMetaParts = [genderLabel, ageLabel].filter(Boolean);

  // ─── Render ────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profil</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => setEditSettingsVisible(true)}>
              <Settings size={20} color={C.primaryDark} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Incomplete profile banner — onboarding eksiklerini göster */}
          {settings && (
            <IncompleteProfileBanner
              settings={settings}
              goals={goals}
              onFill={() => setEditSettingsVisible(true)}
            />
          )}

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatar}>
                <UserRound size={36} color={C.primaryDark} strokeWidth={2} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>

                {/* Cinsiyet + yaş satırı (onboarding'den gelir) */}
                {profileMetaParts.length > 0 && (
                  <Text style={styles.profileMeta}>
                    {profileMetaParts.join(' · ')}
                  </Text>
                )}

                {overview?.motivationalMessage ? (
                  <Text style={styles.profileMotivation}>
                    {overview.motivationalMessage}
                  </Text>
                ) : (
                  <Text style={styles.profileMotivation}>
                    Sağlıklı yaşam yolculuğuna devam ediyorsun ✨
                  </Text>
                )}

                <View style={styles.badgeRow}>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Aktif</Text>
                  </View>
                  {streak > 0 && (
                    <View style={styles.streakWrap}>
                      <Flame size={14} color={C.orange} fill={C.orange} />
                      <Text style={styles.streakText}>{streak} günlük streak</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* E-posta */}
            <View style={styles.emailBox}>
              <Text style={styles.emailLabel}>E-posta</Text>
              <Text style={styles.emailValue}>{email}</Text>
            </View>

            {/* Boy / Kilo / Hedef — onboarding değerleri */}
            {settings && (
              <View style={styles.physicalRow}>
                <View style={styles.physicalChip}>
                  <Text style={styles.physicalValue}>
                    {settings.heightCm != null ? `${settings.heightCm} cm` : '—'}
                  </Text>
                  <Text style={styles.physicalLabel}>Boy</Text>
                </View>
                <View style={styles.physicalDivider} />
                <View style={styles.physicalChip}>
                  <Text style={styles.physicalValue}>
                    {settings.weightKg != null ? `${settings.weightKg} kg` : '—'}
                  </Text>
                  <Text style={styles.physicalLabel}>Kilo</Text>
                </View>
                <View style={styles.physicalDivider} />
                <View style={styles.physicalChip}>
                  <Text style={styles.physicalValue}>
                    {settings.targetWeightKg != null
                      ? `${settings.targetWeightKg} kg`
                      : '—'}
                  </Text>
                  <Text style={styles.physicalLabel}>Hedef</Text>
                </View>
              </View>
            )}
          </View>

          {/* Weekly Summary */}
          <Text style={styles.sectionTitle}>Haftalık Özet</Text>
          <View style={styles.summaryGrid}>
            <SummaryCard
              value={ws?.activeDays ?? 0}
              target={7}
              label="Aktif Gün"
              bg="#EFF2E7"
              valueColor="#7A9E30"
              progress={(ws?.activeDays ?? 0) / 7}
            />
            <SummaryCard
              value={ws?.averageCalories ?? 0}
              target={ws?.dailyCalorieTarget ?? null}
              label="Ort. Kalori"
              bg="#FDF6DC"
              valueColor="#C9A020"
              progress={calorieProgress}
            />
            <SummaryCard
              value={ws?.totalExerciseMinutes ?? 0}
              target={exerciseTarget}
              label="Egzersiz Dk"
              bg="#FBEDEA"
              valueColor="#D45C1E"
              progress={exerciseProgress}
            />
            <SummaryCard
              value={waterLiters}
              target={waterTarget}
              label="Su (L/gün ort)"
              bg="#EAF3FF"
              valueColor="#4A8BC4"
              progress={waterProgress}
            />
          </View>

          {/* Goals */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Hedeflerim</Text>
            {/* FIX: Gerçek goals sayfasına yönlendir, Alert değil */}
            <Pressable
              onPress={() => router.push('/(tabs)/profile/goals')}
              style={styles.sectionAction}>
              <Edit3 size={16} color={C.primaryDark} />
              <Text style={styles.sectionActionText}>Düzenle</Text>
            </Pressable>
          </View>

          <View style={styles.goalsGrid}>
            <GoalChip
              label="Kalori"
              value={goals?.dailyCalorieTarget}
              unit="kcal"
              color="#C9A020"
              softColor="#FDF6DC"
            />
            <GoalChip
              label="Protein"
              value={goals?.dailyProteinTarget}
              unit="g"
              color="#A8C85A"
              softColor={C.primarySoft}
            />
            <GoalChip
              label="Karbonhidrat"
              value={goals?.dailyCarbsTarget}
              unit="g"
              color="#D45C1E"
              softColor="#FBEDEA"
            />
            <GoalChip
              label="Yağ"
              value={goals?.dailyFatTarget}
              unit="g"
              color="#8B7DC8"
              softColor="#F0EEFF"
            />
            <GoalChip
              label="Su"
              value={
  goals?.waterTargetMl
    ? (goals.waterTargetMl / 1000).toFixed(1)
    : null
}
unit="L"
              color="#4A8BC4"
              softColor="#EAF3FF"
            />
            <GoalChip
              label="Hedef Kilo"
              value={goals?.targetWeightKg}
              unit="kg"
              color="#E27A3D"
              softColor="#FBE7DD"
            />
          </View>

          {/* Achievements */}
          {overview?.achievements && overview.achievements.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Başarılar</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.achievementsRow}>
                {overview.achievements.map((a) => (
                  <View key={a.id} style={styles.achievementCard}>
                    <Star size={28} color={C.yellow} fill={C.yellow} />
                    <Text style={styles.achievementTitle}>{a.title}</Text>
                    <Text style={styles.achievementDesc}>{a.description}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Statistics preview */}
          {statistics && (
            <>
              <Text style={styles.sectionTitle}>İstatistikler</Text>
<View style={styles.statsCard}>
  <View style={styles.statRow}>
    <View style={styles.statIconBox}>
      <Dumbbell size={18} color={C.primaryDark} />
    </View>
    <Text style={styles.statLabel}>Toplam Antrenman</Text>
    <Text style={styles.statValue}>{statistics.totalWorkouts ?? 0}</Text>
  </View>

  <View style={styles.historySep} />

  <View style={styles.statRow}>
    <View style={styles.statIconBox}>
      <Zap size={18} color={C.orange} />
    </View>
    <Text style={styles.statLabel}>Güncel Streak</Text>
    <Text style={styles.statValue}>{statistics.currentStreak ?? 0} gün</Text>
  </View>

  <View style={styles.historySep} />

  <View style={styles.statRow}>
    <View style={styles.statIconBox}>
      <TrendingUp size={18} color={C.blue} />
    </View>
    <Text style={styles.statLabel}>En Uzun Streak</Text>
    <Text style={styles.statValue}>{statistics.longestStreak ?? 0} gün</Text>
  </View>
</View>
            </>
          )}

          {/* History preview */}
          {history && history.items.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Geçmiş Aktiviteler</Text>
              <View style={styles.historyCard}>
                {history.items.slice(0, 5).map((item, idx) => (
                  <View key={item.id}>
                    <View style={styles.historyItem}>
                      <View
                        style={[
                          styles.historyDot,
                          {
                            backgroundColor:
                              item.type === 'exercise'
                                ? C.orange
                                : item.type === 'nutrition'
                                ? C.primary
                                : C.blue,
                          },
                        ]}
                      />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyTitle}>{item.title}</Text>
                        <Text style={styles.historyDesc}>{item.description}</Text>
                      </View>
                      <Text style={styles.historyDate}>
                        {new Date(item.date).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                    {idx < Math.min(history.items.length, 5) - 1 && (
                      <View style={styles.historySep} />
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Menu */}
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Target size={20} color={C.primary} strokeWidth={2} />}
              title="Hedeflerim"
              subtitle={undefined}
              // FIX: doğru route
              onPress={() => router.push('/(tabs)/profile/goals')}
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon={<TrendingUp size={20} color={C.orange} strokeWidth={2} />}
              title="İstatistikler"
              // FIX: doğru route
              onPress={() => router.push('/(tabs)/profile/statistics')}
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon={<CalendarDays size={20} color={C.purple} strokeWidth={2} />}
              title="Geçmiş"
              // FIX: doğru route
              onPress={() => router.push('/(tabs)/profile/history')}
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon={<Bell size={20} color={C.yellow} strokeWidth={2} />}
              title="Bildirimler"
              rightNode={
                <Switch
                  value={settings?.notificationsEnabled ?? true}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#DDD', true: C.primary }}
                  thumbColor={C.white}
                />
              }
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon={<Droplets size={20} color={C.blue} strokeWidth={2} />}
              title="Su Takibi"
              subtitle={
                goals?.waterTargetMl
                  ? `Günlük hedef: ${(goals.waterTargetMl / 1000).toFixed(1)} L`
                  : 'Hedef belirlenmedi'
              }
               onPress={() => router.push('/(tabs)/profile/goals')}
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon={<Lock size={20} color={C.subtext} strokeWidth={2} />}
              title="Şifre Değiştir"
              onPress={() => setChangePasswordVisible(true)}
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon={<LogOut size={20} color={C.danger} strokeWidth={2} />}
              title="Çıkış Yap"
              onPress={handleLogout}
              danger
            />
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>

      {/* Modals */}
      {settings && (
        <EditSettingsModal
          visible={editSettingsVisible}
          settings={settings}
          onClose={() => setEditSettingsVisible(false)}
          onSave={handleSaveSettings}
        />
      )}
      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
        onSave={handleSavePassword}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },

  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  stateEmoji: { fontSize: 48, marginBottom: 12 },
  stateTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 6 },
  stateText: { fontSize: 15, color: C.subtext, textAlign: 'center', marginTop: 8 },
  retryBtn: {
    marginTop: 20,
    backgroundColor: C.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },

  // Incomplete banner
  incompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.yellowSoft,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAD87A',
  },
  incompleteBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  incompleteBannerEmoji: { fontSize: 24 },
  incompleteBannerTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  incompleteBannerDesc: { fontSize: 12, color: C.subtext, marginTop: 2, flexShrink: 1 },

  header: {
    marginTop: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: C.primary },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    backgroundColor: C.primarySoft,
    borderRadius: 28,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#D4E8A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginBottom: 2,
  },
  profileMeta: {
    fontSize: 13,
    color: C.subtext,
    marginBottom: 2,
    fontWeight: '600',
  },
  profileMotivation: {
    fontSize: 12,
    color: C.subtext,
    marginBottom: 8,
    lineHeight: 17,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  activeBadge: {
    backgroundColor: '#DDF6D8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '700', color: '#2FA34A' },
  streakWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  streakText: { fontSize: 13, fontWeight: '600', color: C.orange },

  emailBox: {
    marginTop: 16,
    backgroundColor: '#FFFFFFAA',
    borderRadius: 16,
    padding: 12,
  },
  emailLabel: { fontSize: 11, color: C.subtext, marginBottom: 3 },
  emailValue: { fontSize: 14, fontWeight: '600', color: C.text },

  physicalRow: {
    marginTop: 14,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF88',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  physicalChip: { alignItems: 'center', flex: 1 },
  physicalValue: { fontSize: 16, fontWeight: '700', color: C.primaryDark },
  physicalLabel: { fontSize: 11, color: C.subtext, marginTop: 2 },
  physicalDivider: { width: 1, height: 32, backgroundColor: C.border },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionActionText: { fontSize: 14, fontWeight: '600', color: C.primaryDark },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 28,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 22,
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  summaryValue: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  summaryTarget: { fontSize: 12, color: C.subtext, textAlign: 'center', marginTop: -2 },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginTop: 8,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#CCCCCC55',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: { height: '100%', borderRadius: 999 },

  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: '30%',
    flex: 1,
  },
  goalChipValue: { fontSize: 18, fontWeight: '800' },
  goalChipLabel: { fontSize: 11, color: C.subtext, marginTop: 3, fontWeight: '600' },

  achievementsRow: { paddingBottom: 12, gap: 12, marginBottom: 16 },
  achievementCard: {
    backgroundColor: C.yellowSoft,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: 130,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginTop: 8,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 11,
    color: C.subtext,
    marginTop: 4,
    textAlign: 'center',
  },

  statsCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    gap: 12,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  statValue: { fontSize: 15, fontWeight: '700', color: C.primaryDark },

  historyCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    gap: 12,
  },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  historyDesc: { fontSize: 12, color: C.subtext, marginTop: 2 },
  historyDate: { fontSize: 12, color: C.subtext },
  historySep: { height: 1, backgroundColor: C.separator, marginVertical: 2 },

  menuCard: {
    backgroundColor: C.card,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  menuItem: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  menuSubtitle: { fontSize: 12, color: C.subtext, marginTop: 2 },
  menuSep: { height: 1, backgroundColor: C.separator },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  modalCard: {
    backgroundColor: C.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.subtext, marginBottom: 6 },
  textInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
    marginBottom: 16,
    backgroundColor: C.bg,
  },

  // Cinsiyet seçimi
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
  },
  genderChipActive: {
    borderColor: C.primary,
    backgroundColor: C.primarySoft,
  },
  genderChipText: { fontSize: 14, fontWeight: '700', color: C.subtext },
  genderChipTextActive: { color: C.primaryDark },

  menuIcon: {
  width: 42,
  height: 42,
  borderRadius: 12,
  backgroundColor: C.primarySoft,
  alignItems: 'center',
  justifyContent: 'center',
},

menuIconDanger: {
  backgroundColor: '#FDECEC',
},

menuTitleDanger: {
  color: C.danger,
},

menuArrow: {
  fontSize: 28,
  color: C.subtext,
},
  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
});
