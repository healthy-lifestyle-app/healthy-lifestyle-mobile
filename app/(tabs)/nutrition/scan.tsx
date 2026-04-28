import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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

const MOCK_RESULT = {
  name: 'Tavuk Salatası',
  portion: '1 porsiyon',
  calories: 320,
  protein: 24,
  carbs: 18,
  fat: 14,
  ingredients: ['Marul', 'Izgara Tavuk', 'Domates', 'Zeytinyağı'],
};

export default function ScanScreen() {
  const [selectedSource, setSelectedSource] = useState<
    'gallery' | 'camera' | null
  >(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  async function openGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Galeri izni gerekli',
        'Fotoğraf seçebilmek için galeri izni vermelisin.',
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      setSelectedSource('gallery');
      setSelectedImageUri(result.assets[0].uri);
      setShowResult(false);
    } catch {
      Alert.alert('Hata', 'Galeri açılırken bir sorun oluştu.');
    }
  }

  async function openCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Kamera izni gerekli',
        'Fotoğraf çekebilmek için kamera izni vermelisin.',
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      setSelectedSource('camera');
      setSelectedImageUri(result.assets[0].uri);
      setShowResult(false);
    } catch {
      Alert.alert('Hata', 'Kamera açılırken bir sorun oluştu.');
    }
  }

  function handleMockAnalyze() {
    if (!selectedImageUri) {
      Alert.alert(
        'Fotoğraf seçilmedi',
        'Analiz için önce fotoğraf çekmeli veya galeriden seçmelisin.',
      );
      return;
    }

    setIsAnalyzing(true);
    setShowResult(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1500);
  }

  function resetFlow() {
    setSelectedSource(null);
    setSelectedImageUri(null);
    setIsAnalyzing(false);
    setShowResult(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Foto Kalori</Text>
            <Text style={styles.subtitle}>Yemeğinin fotoğrafını analiz et</Text>
          </View>
        </View>

        <View style={styles.cameraCard}>
          {selectedImageUri ? (
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.selectedImage}
            />
          ) : (
            <>
              <View style={styles.cameraIconWrap}>
                <MaterialCommunityIcons
                  name="image-search-outline"
                  size={44}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.cameraTitle}>Fotoğrafını yükle veya çek</Text>
              <Text style={styles.cameraText}>
                Yapay zeka yemeğini analiz edip tahmini kalori ve içerik bilgisi
                oluştursun.
              </Text>
            </>
          )}

          {selectedImageUri ? (
            <View style={styles.selectedInfoBox}>
              <Ionicons
                name={
                  selectedSource === 'gallery'
                    ? 'images-outline'
                    : 'camera-outline'
                }
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.selectedInfoText}>
                {selectedSource === 'gallery'
                  ? 'Galeriden fotoğraf seçildi'
                  : 'Kameradan fotoğraf çekildi'}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.galleryButton}
              activeOpacity={0.85}
              onPress={openGallery}
              disabled={isAnalyzing}
            >
              <Ionicons
                name="images-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.galleryButtonText}>Galeriden Seç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              activeOpacity={0.85}
              onPress={openCamera}
              disabled={isAnalyzing}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color={COLORS.orange}
              />
              <Text style={styles.cameraButtonText}>Foto Çek</Text>
            </TouchableOpacity>
          </View>

          {selectedImageUri ? (
            <TouchableOpacity
              style={styles.analyzeButton}
              activeOpacity={0.85}
              onPress={handleMockAnalyze}
              disabled={isAnalyzing}
            >
              <Ionicons name="sparkles-outline" size={18} color={COLORS.white} />
              <Text style={styles.analyzeButtonText}>Analiz Et</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isAnalyzing && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingTitle}>Analiz ediliyor...</Text>
            <Text style={styles.loadingText}>
              {selectedSource === 'gallery'
                ? 'Galeriden seçtiğin fotoğraf işleniyor.'
                : 'Çekilen fotoğraf işleniyor.'}
            </Text>
          </View>
        )}

        {showResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultTitle}>Analiz Sonucu</Text>

              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={resetFlow}
              >
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.retryButtonText}>Yeniden Dene</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.foodPreview}>
              <View style={styles.foodPreviewImage}>
                <Ionicons
                  name="restaurant-outline"
                  size={28}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.foodPreviewInfo}>
                <Text style={styles.foodName}>{MOCK_RESULT.name}</Text>
                <Text style={styles.foodMeta}>
                  {MOCK_RESULT.portion} • Tahmini analiz
                </Text>
              </View>
            </View>

            <View style={styles.kcalBox}>
              <Text style={styles.kcalValue}>{MOCK_RESULT.calories} kcal</Text>
              <Text style={styles.kcalLabel}>Tahmini toplam enerji</Text>
            </View>

            <View style={styles.macrosRow}>
              <View
                style={[styles.macroPill, { backgroundColor: COLORS.greenSoft }]}
              >
                <Text style={[styles.macroValue, { color: COLORS.green }]}>
                  {MOCK_RESULT.protein}g
                </Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>

              <View style={[styles.macroPill, { backgroundColor: '#FFF4DA' }]}>
                <Text style={[styles.macroValue, { color: '#D4A63D' }]}>
                  {MOCK_RESULT.carbs}g
                </Text>
                <Text style={styles.macroLabel}>Karbonhidrat</Text>
              </View>

              <View
                style={[
                  styles.macroPill,
                  { backgroundColor: COLORS.primarySoft },
                ]}
              >
                <Text style={[styles.macroValue, { color: COLORS.primary }]}>
                  {MOCK_RESULT.fat}g
                </Text>
                <Text style={styles.macroLabel}>Yağ</Text>
              </View>
            </View>

            <View style={styles.tagsWrap}>
              {MOCK_RESULT.ingredients.map((item) => (
                <View key={item} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addMealButton}
              activeOpacity={0.85}
              onPress={() => router.push('/nutrition/add-meal')}
            >
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.addMealButtonText}>Öğüne Ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
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
  selectedImage: {
    width: '100%',
    height: 260,
    borderRadius: 22,
    marginBottom: 14,
    backgroundColor: '#E8E3F6',
  },
  selectedInfoBox: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  selectedInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
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
  analyzeButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  analyzeButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },

  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ECE7F5',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  loadingTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: 'center',
  },

  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ECE7F5',
    padding: 18,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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