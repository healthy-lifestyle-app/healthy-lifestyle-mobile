import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  ChevronRight,
  Flame,
  LogOut,
  Settings,
  Target,
  TrendingUp,
  Bell,
  CalendarDays,
  Droplets,
  Dumbbell,
  UserRound,
} from 'lucide-react-native';

import { useAuth } from '@/context/AuthContext';

const COLORS = {
  bg: '#FCFBF8',
  card: '#F2F1F7',
  white: '#FFFFFF',
  text: '#1F2430',
  subtext: '#667085',
  primary: '#5B567D',
  softPrimary: '#ECEAF6',
  green: '#A8C85A',
  softGreen: '#EEF5DD',
  orange: '#F27A3D',
  softOrange: '#FBE7DD',
  blue: '#7FB3FF',
  softBlue: '#EAF3FF',
  lavender: '#C9C4F2',
  border: '#E9E7F2',
  danger: '#E25555',
  softDanger: '#FDEAEA',
};

type SummaryCardProps = {
  value: string;
  label: string;
  subtitle: string;
  bgColor: string;
  valueColor: string;
};

function SummaryCard({
  value,
  label,
  subtitle,
  bgColor,
  valueColor,
}: SummaryCardProps) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bgColor }]}>
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  danger?: boolean;
};

function MenuItem({ icon, title, onPress, danger = false }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.menuLeft}>
        <View
          style={[
            styles.menuIconBox,
            danger && { backgroundColor: COLORS.softDanger },
          ]}>
          {icon}
        </View>
        <Text style={[styles.menuTitle, danger && { color: COLORS.danger }]}>
          {title}
        </Text>
      </View>

      <ChevronRight
        size={22}
        color={danger ? COLORS.danger : '#A0A7B8'}
        strokeWidth={2}
      />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const displayName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'Kullanıcı';

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Oturumu kapatmak istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/auth/login');
          } catch {
            Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <Pressable style={styles.iconButton}>
            <Settings size={20} color={COLORS.primary} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <UserRound size={34} color={COLORS.primary} strokeWidth={2.2} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.meta}>Sağlıklı yaşam yolculuğuna devam ediyorsun ✨</Text>

              <View style={styles.badgeRow}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Aktif</Text>
                </View>

                <View style={styles.streakWrap}>
                  <Flame size={15} color={COLORS.orange} fill={COLORS.orange} />
                  <Text style={styles.streakText}>5 günlük streak</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.emailBox}>
            <Text style={styles.emailLabel}>E-posta</Text>
            <Text style={styles.emailValue}>{user?.email ?? '-'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Haftalık Özet</Text>

        <View style={styles.summaryGrid}>
          <SummaryCard
            value="5"
            subtitle="/ 7"
            label="Aktif Gün"
            bgColor="#EFF2E7"
            valueColor="#9AAF4B"
          />
          <SummaryCard
            value="1,850"
            subtitle="/ 2,000"
            label="Ortalama Kalori"
            bgColor="#F8F4EA"
            valueColor="#F0C96B"
          />
          <SummaryCard
            value="180"
            subtitle="/ 300"
            label="Egzersiz Dk"
            bgColor="#FBEDEA"
            valueColor="#F0672A"
          />
          <SummaryCard
            value="12"
            subtitle="/ 14"
            label="Su (Litre)"
            bgColor="#F3F2F8"
            valueColor="#B9B4E8"
          />
        </View>

        <Text style={styles.sectionTitle}>Menü</Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon={<Target size={22} color="#9AAF4B" strokeWidth={2} />}
            title="Hedeflerim"
          />
          <MenuItem
            icon={<TrendingUp size={22} color="#F0672A" strokeWidth={2} />}
            title="İstatistikler"
          />
          <MenuItem
            icon={<CalendarDays size={22} color="#B9B4E8" strokeWidth={2} />}
            title="Geçmiş"
          />
          <MenuItem
            icon={<Bell size={22} color="#E4BB62" strokeWidth={2} />}
            title="Bildirimler"
          />
          <MenuItem
            icon={<Droplets size={22} color="#7FB3FF" strokeWidth={2} />}
            title="Su Takibi"
          />
          <MenuItem
            icon={<Dumbbell size={22} color={COLORS.primary} strokeWidth={2} />}
            title="Egzersiz Ayarları"
          />
          <MenuItem
            icon={<LogOut size={22} color={COLORS.danger} strokeWidth={2} />}
            title="Çıkış Yap"
            onPress={handleLogout}
            danger
          />
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginTop: 8,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 33,
    fontWeight: '800',
    color: COLORS.primary,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: COLORS.softPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: COLORS.softPrimary,
    borderRadius: 28,
    padding: 18,
    marginBottom: 28,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#DDD9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.subtext,
    marginBottom: 10,
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
    paddingVertical: 6,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2FA34A',
  },
  streakWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.orange,
  },
  emailBox: {
    marginTop: 18,
    backgroundColor: '#FFFFFFAA',
    borderRadius: 18,
    padding: 14,
  },
  emailLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 28,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 24,
    padding: 18,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  summarySubtitle: {
    fontSize: 13,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: -2,
  },
  summaryLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D475C',
    textAlign: 'center',
    marginTop: 10,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#C9C6D4',
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    width: '72%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F5F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
});