import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Dumbbell,
  Droplets,
  Flame,
  Scale,
  Utensils,
  Activity,
} from 'lucide-react-native';

import { profileApi, type HistoryItem } from '@/api/profile';

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

// ─── Helpers ─────────────────────────────────────────────────

type ActivityType = 'exercise' | 'nutrition' | 'water' | 'weight' | string;

function getTypeConfig(type: ActivityType): {
  icon: React.ReactNode;
  iconBg: string;
  dotColor: string;
  label: string;
} {
  switch (type) {
    case 'exercise':
      return {
        icon: <Dumbbell size={18} color={C.orange} strokeWidth={2} />,
        iconBg: C.orangeSoft,
        dotColor: C.orange,
        label: 'Egzersiz',
      };
    case 'nutrition':
      return {
        icon: <Utensils size={18} color={C.primaryDark} strokeWidth={2} />,
        iconBg: C.primarySoft,
        dotColor: C.primary,
        label: 'Beslenme',
      };
    case 'water':
      return {
        icon: <Droplets size={18} color={C.blue} strokeWidth={2} />,
        iconBg: C.blueSoft,
        dotColor: C.blue,
        label: 'Su',
      };
    case 'weight':
      return {
        icon: <Scale size={18} color={C.purple} strokeWidth={2} />,
        iconBg: C.purpleSoft,
        dotColor: C.purple,
        label: 'Kilo',
      };
    default:
      return {
        icon: <Activity size={18} color={C.subtext} strokeWidth={2} />,
        iconBg: '#F0F0F0',
        dotColor: C.subtext,
        label: type,
      };
  }
}

function formatDate(dateStr: string): { day: string; month: string; time: string } {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('tr-TR', { day: '2-digit' }),
    month: d.toLocaleDateString('tr-TR', { month: 'short' }),
    time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  };
}

function groupByDate(items: HistoryItem[]): Record<string, HistoryItem[]> {
  return items.reduce<Record<string, HistoryItem[]>>((acc, item) => {
    const key = new Date(item.date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// ─── History Item Card ────────────────────────────────────────

interface HistoryCardProps {
  item: HistoryItem;
  isLast: boolean;
}

function HistoryCard({ item, isLast }: HistoryCardProps) {
  const config = getTypeConfig(item.type);
  const { time } = formatDate(item.date);

  return (
    <View>
      <View style={styles.historyItem}>
        {/* Timeline dot + line */}
        <View style={styles.timeline}>
          <View style={[styles.timelineDot, { backgroundColor: config.dotColor }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Card */}
        <View style={styles.historyCard}>
          <View style={styles.historyCardTop}>
            <View style={[styles.historyIcon, { backgroundColor: config.iconBg }]}>
              {config.icon}
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.historyDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <Text style={styles.historyTime}>{time}</Text>
          </View>

          <View style={styles.historyTypeBadge}>
            <View style={[styles.historyTypeDot, { backgroundColor: config.dotColor }]} />
            <Text style={[styles.historyTypeText, { color: config.dotColor }]}>
              {config.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Filter Tab ───────────────────────────────────────────────

const FILTERS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Tümü', icon: <Activity size={14} color="inherit" /> },
  { value: 'exercise', label: 'Egzersiz', icon: <Dumbbell size={14} color="inherit" /> },
  { value: 'nutrition', label: 'Beslenme', icon: <Utensils size={14} color="inherit" /> },
  { value: 'water', label: 'Su', icon: <Droplets size={14} color="inherit" /> },
];

// ─── Main Screen ──────────────────────────────────────────────

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchHistory = useCallback(async (isRefresh = false) => {
    try {
      setError(false);
      if (isRefresh) setRefreshing(true);
      const data = await profileApi.getHistory();
      setItems(data.items ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const onRefresh = useCallback(() => fetchHistory(true), [fetchHistory]);

  const filteredItems =
    activeFilter === 'all'
      ? items
      : items.filter((i) => i.type === activeFilter);

  const grouped = groupByDate(filteredItems);
  const groupKeys = Object.keys(grouped);

  // ─── States ───────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Geçmiş yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>📋</Text>
          <Text style={styles.errorTitle}>Yüklenemedi</Text>
          <Pressable style={styles.retryBtn} onPress={() => fetchHistory()}>
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
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.primaryDark} strokeWidth={2.5} />
          </Pressable>
          <Text style={styles.headerTitle}>Geçmiş</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredItems.length}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              style={[
                styles.filterChip,
                activeFilter === f.value && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f.value)}>
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f.value && styles.filterChipTextActive,
                ]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Flame size={48} color={C.border} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Aktivite bulunamadı</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'all'
                ? 'Henüz hiç aktivite kaydedilmemiş.'
                : `${FILTERS.find((f) => f.value === activeFilter)?.label} aktivitesi yok.`}
            </Text>
          </View>
        )}

        {/* Grouped History List */}
        {groupKeys.map((dateKey) => (
          <View key={dateKey} style={styles.dateGroup}>
            {/* Date Header */}
            <View style={styles.dateHeader}>
              <View style={styles.dateLine} />
              <Text style={styles.dateLabel}>{dateKey}</Text>
              <View style={styles.dateLine} />
            </View>

            {/* Items */}
            {grouped[dateKey].map((item, idx) => (
              <HistoryCard
                key={item.id}
                item={item}
                isLast={idx === grouped[dateKey].length - 1}
              />
            ))}
          </View>
        ))}

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
  countBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countBadgeText: { fontSize: 15, fontWeight: '800', color: C.primaryDark },

  filterScroll: { marginBottom: 24 },
  filterRow: { gap: 8, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  filterChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterChipText: { fontSize: 14, fontWeight: '700', color: C.subtext },
  filterChipTextActive: { color: C.white },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  emptyDesc: { fontSize: 14, color: C.subtext, textAlign: 'center' },

  dateGroup: { marginBottom: 8 },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: C.separator },
  dateLabel: { fontSize: 13, fontWeight: '700', color: C.subtext },

  historyItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
    paddingTop: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: C.separator,
    marginTop: 4,
  },
  historyCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  historyCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  historyDesc: { fontSize: 12, color: C.subtext, marginTop: 3, lineHeight: 17 },
  historyTime: { fontSize: 12, color: C.subtext, fontWeight: '600' },
  historyTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.separator,
  },
  historyTypeDot: { width: 6, height: 6, borderRadius: 3 },
  historyTypeText: { fontSize: 12, fontWeight: '700' },
});