import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import { addWater } from '@/api/activity';
import Screen from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { useHomeData } from '@/hooks/useHomeData';
import { useStepCount } from '@/hooks/useStepCount';

const moods = [
  {
    key: 'sad',
    icon: '☹',
    color: '#C9C3E8',
    message:
      'Bugün biraz düşük hissediyor olabilirsin. Küçük bir başlangıç bile yeterli 🌿',
  },
  {
    key: 'calm',
    icon: '☺',
    color: '#E8DDC8',
    message: 'Sakin bir gündesin. Dengeli ilerlemek için güzel bir zaman 🤍',
  },
  {
    key: 'good',
    icon: '😊',
    color: '#A8C85A',
    message:
      'Harika gidiyorsun! Bu pozitif enerjiyi koru ve gününü dolu dolu yaşa ✨',
  },
  {
    key: 'okay',
    icon: '😌',
    color: '#C9C3E8',
    message:
      'Bugün dengeli görünüyorsun. Küçük ama düzenli adımlar seni ileri taşır 💪',
  },
  {
    key: 'hot',
    icon: '🥵',
    color: '#F59A6B',
    message:
      'Biraz yorgun hissedebilirsin. Kendine nazik davran ve tempoyu dengeli tut 🌸',
  },
];

function formatWaterMl(ml: number): string {
  if (ml <= 0) {
    return '0 ml';
  }

  if (ml < 1000) {
    return `${Math.round(ml)} ml`;
  }

  return `${(ml / 1000).toFixed(1).replace('.0', '')} L`;
}

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

      <View style={styles.smallMetricContent}>
        <Text style={styles.smallMetricTitle}>{title}</Text>
        <Text style={styles.smallMetricValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [isAddingWater, setIsAddingWater] = useState(false);
  const [selectedWaterAmount, setSelectedWaterAmount] = useState<number | null>(
    null,
  );
  const [customWaterMl, setCustomWaterMl] = useState('');

  const { user } = useAuth();

  const { nutrition, water, activity, isLoading, hasError, refresh } =
    useHomeData();

  const { steps, refreshSteps, isAvailable, hasPermission } = useStepCount();

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshSteps();
    }, [refresh, refreshSteps]),
  );

  const userProfile = (user as any)?.profile;

  const userName =
    userProfile?.fullName?.trim() ||
    (user as any)?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'Kullanıcı';

  const currentWeight = Number(
    userProfile?.weightKg ?? userProfile?.currentWeightKg ?? 0,
  );

  const targetWeight = Number(
    userProfile?.targetWeightKg ?? userProfile?.targetWeight ?? 0,
  );

  const startWeight = Number(
    userProfile?.startWeightKg ?? userProfile?.startWeight ?? currentWeight,
  );

const currentWeightKg = currentWeight;
const targetWeightKg = targetWeight;

const hasWeightGoal = currentWeightKg > 0 && targetWeightKg > 0;

const totalGoalDiffKg = hasWeightGoal
  ? Math.abs(startWeight - targetWeightKg)
  : 0;

const remainingKg = hasWeightGoal
  ? Math.abs(currentWeightKg - targetWeightKg)
  : 0;

const completedKg = hasWeightGoal
  ? Math.max(totalGoalDiffKg - remainingKg, 0)
  : 0;

const goalPercent = useMemo(() => {
  if (!hasWeightGoal || totalGoalDiffKg <= 0) {
    return currentWeightKg === targetWeightKg && hasWeightGoal ? 100 : 0;
  }

  return Math.min((completedKg / totalGoalDiffKg) * 100, 100);
}, [completedKg, currentWeightKg, hasWeightGoal, targetWeightKg, totalGoalDiffKg]);

  const caloriesValue = nutrition?.calories ?? 0;
  const exerciseMinutes = activity?.totalDurationMinutes ?? 0;

  const stepText =
    !isAvailable || !hasPermission
      ? '—'
      : steps > 0
        ? steps.toLocaleString('tr-TR')
        : '0';

  const consumedMl = water?.consumedMl ?? 0;
  const goalMl = water?.goalMl ?? 2500;
  const waterText = `${formatWaterMl(consumedMl)} / ${formatWaterMl(goalMl)}`;

  const openWaterModal = () => {
    setWaterModalVisible(true);
  };

  const closeWaterModal = () => {
    if (isAddingWater) {
      return;
    }

    setWaterModalVisible(false);
    setSelectedWaterAmount(null);
    setCustomWaterMl('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([refresh(), refreshSteps()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddWater = async (
    amountMl: number,
    loadingAmount: number | null,
  ) => {
    if (isAddingWater) {
      return;
    }

    if (!Number.isFinite(amountMl) || amountMl <= 0) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir su miktarı gir.');
      return;
    }

    try {
      setSelectedWaterAmount(loadingAmount);
      setIsAddingWater(true);

      await addWater(amountMl, consumedMl, goalMl);
      await refresh();

      setWaterModalVisible(false);
      setCustomWaterMl('');
      setSelectedWaterAmount(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Su tüketimi eklenirken bir sorun oluştu.';

      Alert.alert('Hata', message);
    } finally {
      setIsAddingWater(false);
      setSelectedWaterAmount(null);
    }
  };

  const handleAddCustomWater = async () => {
    Keyboard.dismiss();

    const amount = Number(customWaterMl);

    if (!customWaterMl.trim() || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir su miktarı gir.');
      return;
    }

    await handleAddWater(amount, -2);
  };

  if (isLoading) {
    return (
      <Screen backgroundColor='#F8F5EE' edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#9DB65A' />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor='#F8F5EE' edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor='#9DB65A'
          />
        }
      >
        <View style={styles.content}>
          {hasError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                Bazı veriler yüklenemedi. Aşağı çekerek yenile.
              </Text>
            </View>
          )}

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Merhaba, {userName}!</Text>
              <Text style={styles.subGreeting}>
                Bugün kendini nasıl hissediyorsun?
              </Text>
            </View>

            <Pressable
              style={styles.avatarButton}
              onPress={() => router.push('/profile')}
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
                      prev === mood.key ? null : mood.key,
                    )
                  }
                  style={[
                    styles.moodButton,
                    {
                      borderColor: isSelected ? mood.color : '#E6E2D8',
                      backgroundColor: isSelected ? mood.color : '#F8F5EE',
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
            <CircleStat
              value={caloriesValue.toLocaleString('tr-TR')}
              label='kcal'
              ringColor='#9DB65A'
            />

            <CircleStat value={stepText} label='adım' ringColor='#C8C4E8' />
          </View>

          <View style={styles.metricsRow}>
            <Pressable style={styles.metricPressable} onPress={openWaterModal}>
              <SmallMetric
                icon='💧'
                iconBg='#F7E9C8'
                title='Su'
                value={waterText}
              />
              <Text style={styles.metricHint}>+ Su ekle</Text>
            </Pressable>

            <View style={styles.metricPressable}>
              <SmallMetric
                icon='⚡'
                iconBg='#FFD8C7'
                title='Egzersiz'
                value={`${exerciseMinutes} dk`}
              />
            </View>
          </View>

          <View style={styles.progressCard}>
  <View style={styles.progressHeader}>
    <View style={styles.progressBadge}>
      <Text style={styles.progressBadgeText}>〰</Text>
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.progressTitle}>Harika İlerleme! 🎉</Text>
      <Text style={styles.progressSubtitle}>
        {hasWeightGoal
          ? `${currentWeightKg.toFixed(1)} kg → ${targetWeightKg.toFixed(
              1,
            )} kg hedefine ilerliyorsun`
          : 'Hedefe doğru ilerliyorsun'}
      </Text>
    </View>
  </View>

  <View style={styles.weightInfoBox}>
    <View>
      <Text style={styles.weightMain}>
        {hasWeightGoal
          ? `Şu an: ${currentWeightKg.toFixed(1)} kg`
          : 'Kilo hedefi bulunamadı'}
      </Text>

      <Text style={styles.weightSub}>
        {hasWeightGoal
          ? `Hedef: ${targetWeightKg.toFixed(1)} kg`
          : 'Profilinden hedef kilonu ekleyebilirsin'}
      </Text>
    </View>

    <Text style={styles.weightGreen}>
      {hasWeightGoal ? `${remainingKg.toFixed(1)}\nkg` : '—'}
    </Text>
  </View>

  <View style={styles.goalRow}>
    <Text style={styles.goalLabel}>
      {hasWeightGoal
        ? `Hedef: ${targetWeightKg.toFixed(1)} kg`
        : 'Hedef belirlenmedi'}
    </Text>

    <Text style={styles.goalPercent}>
      %{goalPercent.toFixed(1)} tamamlandı
    </Text>
  </View>

  <View style={styles.goalTrack}>
    <View style={[styles.goalFill, { width: `${goalPercent}%` }]} />
  </View>

  <Text style={styles.remainingText}>
    {hasWeightGoal
      ? `Kalan: ${remainingKg.toFixed(1)} kg`
      : 'Kalan bilgi hesaplanamadı'}
  </Text>
</View>

          <View style={styles.actionSection}>
            <View style={styles.topActionRow}>
              <Pressable
                style={[styles.smallActionCard, styles.mealCard]}
                onPress={() => router.push('/nutrition/add-meal')}
              >
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: '#A8C85A' },
                  ]}
                >
                  <Text style={styles.actionIcon}>🍽</Text>
                </View>
                <Text style={styles.actionTitle}>Öğün Ekle</Text>
                <Text style={styles.actionSub}>Yediğin öğünü kaydet</Text>
              </Pressable>

              <Pressable
                style={[styles.smallActionCard, styles.exerciseCardSmall]}
                onPress={() => router.push('/exercise')}
              >
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: '#F3C96B' },
                  ]}
                >
                  <Text style={styles.actionIcon}>〰</Text>
                </View>
                <Text style={styles.actionTitle}>Egzersiz</Text>
                <Text style={styles.actionSub}>Antrenman başlat</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.scanActionCard}
              onPress={() => router.push('/nutrition/scan')}
            >
              <View
                style={[styles.actionIconWrap, { backgroundColor: '#7F74AE' }]}
              >
                <Text style={[styles.actionIcon, { color: '#FFFFFF' }]}>
                  ⌘
                </Text>
              </View>
              <Text style={styles.scanActionTitle}>Ürün Tara</Text>
              <Text style={styles.scanActionSub}>AI ile analiz et</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={waterModalVisible}
        transparent
        animationType='fade'
        onRequestClose={closeWaterModal}
      >
        <View style={styles.waterModalOverlay}>
          <View style={styles.waterModalCard}>
            <Text style={styles.waterModalTitle}>Su ekle</Text>
            <Text style={styles.waterModalSubtitle}>
              İçtiğin su miktarını seç veya ml olarak kendin yaz.
            </Text>

            <View style={styles.waterOptionsGrid}>
              {[250, 500, 750, 1000].map((amount) => {
                const isSelectedLoading =
                  isAddingWater && selectedWaterAmount === amount;

                return (
                  <Pressable
                    key={amount}
                    style={[
                      styles.waterOptionButton,
                      isAddingWater && styles.disabledButton,
                    ]}
                    onPress={() => handleAddWater(amount, amount)}
                    disabled={isAddingWater}
                    hitSlop={8}
                  >
                    {isSelectedLoading ? (
                      <ActivityIndicator size='small' color='#FFFFFF' />
                    ) : (
                      <Text style={styles.waterOptionText}>
                        +{amount >= 1000 ? '1 L' : `${amount} ml`}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.customSection}>
              <Text style={styles.inputLabel}>Kendi miktarını yaz</Text>

              <View style={styles.customWaterBox}>
                <TextInput
                  value={customWaterMl}
                  onChangeText={(text) => {
                    setCustomWaterMl(text.replace(/[^0-9]/g, ''));
                  }}
                  placeholder='Örn: 300'
                  keyboardType='number-pad'
                  editable={!isAddingWater}
                  style={styles.customWaterInput}
                  returnKeyType='done'
                  onSubmitEditing={handleAddCustomWater}
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.customWaterButton,
                    pressed && styles.pressedButton,
                    isAddingWater && styles.disabledButton,
                  ]}
                  onPress={handleAddCustomWater}
                  disabled={isAddingWater}
                  hitSlop={8}
                >
                  {isAddingWater && selectedWaterAmount === -2 ? (
                    <ActivityIndicator size='small' color='#FFFFFF' />
                  ) : (
                    <Text style={styles.customWaterButtonText}>Ekle</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[
                styles.waterCancelButton,
                isAddingWater && styles.disabledButton,
              ]}
              onPress={closeWaterModal}
              disabled={isAddingWater}
            >
              <Text style={styles.waterCancelText}>Vazgeç</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 24,
    backgroundColor: '#F8F5EE',
  },
  content: {
    flex: 1,
    gap: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    backgroundColor: '#FDE8E8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F5C6C6',
  },
  errorBannerText: {
    fontSize: 12,
    color: '#C0392B',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E2B2B',
  },
  subGreeting: {
    marginTop: 6,
    fontSize: 12,
    color: '#6F6B66',
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C8BEE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  moodButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  moodIcon: {
    fontSize: 13,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFE1D9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#544B46',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 2,
  },
  circleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  circleOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F5EE',
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E2B2B',
  },
  circleLabel: {
    fontSize: 11,
    color: '#7A7670',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricPressable: {
    flex: 1,
  },
  metricHint: {
    fontSize: 10,
    color: '#9DB65A',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '700',
  },
  smallMetricCard: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4EFE4',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  smallMetricContent: {
    flex: 1,
  },
  smallMetricIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallMetricIconText: {
    fontSize: 13,
  },
  smallMetricTitle: {
    fontSize: 11,
    color: '#5E5A56',
  },
  smallMetricValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E2B2B',
    marginTop: 2,
  },
  progressCard: {
  backgroundColor: '#EAF3FF',          // #EEF5DE → #EAF3FF (mavi)
  borderRadius: 18,
  padding: 14,
  gap: 12,
  borderWidth: 1,
  borderColor: 'rgba(90, 151, 240, 0.3)', // yeşil border → mavi border
},
  progressHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  progressBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#9CB45A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadgeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E2B2B',
  },
  progressSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#5F5A55',
  },
  weightInfoBox: {
    backgroundColor: '#F5F0E8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightMain: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2E2B2B',
  },
  weightSub: {
    fontSize: 11,
    color: '#6F6B66',
    marginTop: 3,
  },
  weightGreen: {
    textAlign: 'right',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
    color: '#87A63E',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 11,
    color: '#5F5A55',
  },
  goalPercent: {
    fontSize: 11,
    color: '#87A63E',
    fontWeight: '700',
  },
  goalTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#EEF1E2',
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: '#9CB45A',
    borderRadius: 999,
  },
  remainingText: {
    fontSize: 10,
    color: '#6D6A65',
    textAlign: 'center',
  },
  actionSection: {
    gap: 14,
    flex: 1,
  },
  topActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallActionCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 142,
    borderWidth: 1,
  },
  mealCard: {
    backgroundColor: '#EEF2E8',
    borderColor: '#C8D8BE',
  },
  exerciseCardSmall: {
    backgroundColor: '#F7F0DF',
    borderColor: '#EFCF8B',
  },
  scanActionCard: {
    width: '100%',
    flex: 1,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 28,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECE8F8',
    borderWidth: 1,
    borderColor: '#D4CDED',
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionIcon: {
    fontSize: 17,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E2B2B',
    textAlign: 'center',
  },
  actionSub: {
    fontSize: 12,
    color: '#7A7670',
    marginTop: 8,
    textAlign: 'center',
  },
  scanActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E2B2B',
    textAlign: 'center',
  },
  scanActionSub: {
    fontSize: 13,
    color: '#7A7670',
    marginTop: 10,
    textAlign: 'center',
  },
  waterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.28)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 18,
  },
  waterModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
  },
  waterModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E2B2B',
    textAlign: 'center',
  },
  waterModalSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#6F6B66',
    textAlign: 'center',
  },
  waterOptionsGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  waterOptionButton: {
    width: '47%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#7EB6D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterOptionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  customSection: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E5A56',
    marginBottom: 6,
  },
  customWaterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  customWaterInput: {
    flex: 1,
    minWidth: 0,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F8F5EE',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#2E2B2B',
    fontWeight: '700',
  },
  customWaterButton: {
    width: 86,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#9DB65A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 2,
    elevation: 2,
  },
  pressedButton: {
    opacity: 0.8,
  },
  customWaterButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  waterCancelButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F4EFE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  waterCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5E5A56',
  },
  disabledButton: {
    opacity: 0.6,
  },
});