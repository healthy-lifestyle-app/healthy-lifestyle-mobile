import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  primary: '#5E578F',
  primarySoft: '#F1EEFA',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  orange: '#FF6B1A',
  orangeSoft: '#FDE5DA',
  border: '#E6E2F0',
  white: '#FFFFFF',
};

export default function ScanScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Ionicons name='chevron-back' size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Foto Kalori</Text>
            <Text style={styles.subtitle}>Yemeğinin fotoğrafını analiz et</Text>
          </View>
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.cameraIconWrap}>
            <MaterialCommunityIcons
              name='image-search-outline'
              size={44}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.cameraTitle}>Fotoğrafını yükle veya çek</Text>
          <Text style={styles.cameraText}>
            Yapay zeka yemeğini analiz edip tahmini kalori ve içerik bilgisi oluştursun.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.galleryButton} activeOpacity={0.85}>
              <Ionicons name='images-outline' size={18} color={COLORS.primary} />
              <Text style={styles.galleryButtonText}>Galeriden Seç</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.85}>
              <Ionicons name='camera-outline' size={18} color={COLORS.orange} />
              <Text style={styles.cameraButtonText}>Foto Çek</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analiz Sonucu</Text>

          <View style={styles.foodPreview}>
            <View style={styles.foodPreviewImage}>
              <Ionicons name='restaurant-outline' size={28} color={COLORS.primary} />
            </View>

            <View style={styles.foodPreviewInfo}>
              <Text style={styles.foodName}>Tavuk Salatası</Text>
              <Text style={styles.foodMeta}>1 porsiyon • Tahmini analiz</Text>
            </View>
          </View>

          <View style={styles.kcalBox}>
            <Text style={styles.kcalValue}>320 kcal</Text>
            <Text style={styles.kcalLabel}>Tahmini toplam enerji</Text>
          </View>

          <View style={styles.macrosRow}>
            <View style={[styles.macroPill, { backgroundColor: COLORS.greenSoft }]}>
              <Text style={[styles.macroValue, { color: COLORS.green }]}>24g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>

            <View style={[styles.macroPill, { backgroundColor: '#FFF4DA' }]}>
              <Text style={[styles.macroValue, { color: '#D4A63D' }]}>18g</Text>
              <Text style={styles.macroLabel}>Karbonhidrat</Text>
            </View>

            <View style={[styles.macroPill, { backgroundColor: COLORS.primarySoft }]}>
              <Text style={[styles.macroValue, { color: COLORS.primary }]}>14g</Text>
              <Text style={styles.macroLabel}>Yağ</Text>
            </View>
          </View>

          <View style={styles.tagsWrap}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Marul</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Izgara Tavuk</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Domates</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Zeytinyağı</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addMealButton}
            activeOpacity={0.85}
            onPress={() => router.push('/nutrition/add-meal')}
          >
            <Ionicons name='add' size={18} color={COLORS.white} />
            <Text style={styles.addMealButtonText}>Öğüne Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#5D6472',
  },

  cameraCard: {
    backgroundColor: '#F3F1F8',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  cameraIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8E3F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#727887',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  galleryButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#BDB6DA',
    backgroundColor: '#FAF9FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  galleryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cameraButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F2B29E',
    backgroundColor: '#FFF1EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
  },

  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ECE7F5',
    padding: 18,
  },
  resultTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },

  foodPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodPreviewImage: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F1EEFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  foodPreviewInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  foodMeta: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },

  kcalBox: {
    borderRadius: 22,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.green,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  kcalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.green,
    marginBottom: 4,
  },
  kcalLabel: {
    fontSize: 13,
    color: '#5F6A52',
    fontWeight: '600',
  },

  macrosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  macroPill: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#5E6573',
    fontWeight: '600',
    textAlign: 'center',
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  tag: {
    backgroundColor: '#F5F3FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D6380',
  },

  addMealButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addMealButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
});