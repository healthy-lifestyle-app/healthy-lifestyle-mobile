import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import Screen from '@/components/Screen';
import { createRecipe, type RecipeCategory } from '@/lib/recipesStore';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  primary: '#5E578F',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  blue: '#5A97F0',
  blueSoft: '#EAF3FF',
  purpleSoft: '#F0EDFA',
  yellow: '#F2CF7B',
  yellowSoft: '#FFF4DA',
  border: '#E6E2F0',
  white: '#FFFFFF',
};

const CATEGORIES: RecipeCategory[] = ['Kahvaltı', 'Öğle', 'Akşam', 'Atıştırma'];

export default function AddRecipeScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Kahvaltı');
  const [durationMin, setDurationMin] = useState('30');
  const [servings, setServings] = useState('2');
  const [calories, setCalories] = useState('450');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [tags, setTags] = useState('Protein, Lif');
  const [saving, setSaving] = useState(false);

  const updateList = (
    list: string[],
    setList: (value: string[]) => void,
    index: number,
    value: string,
  ) => {
    const next = [...list];
    next[index] = value;
    setList(next);
  };

  const handleSave = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert('Uyarı', 'Tarif adı zorunlu.');
      return;
    }

    const cleanIngredients = ingredients.map((item) => item.trim()).filter(Boolean);
    const cleanSteps = steps.map((item) => item.trim()).filter(Boolean);

    if (cleanIngredients.length === 0 || cleanSteps.length === 0) {
      Alert.alert('Uyarı', 'En az 1 malzeme ve 1 adım gir.');
      return;
    }

    try {
      setSaving(true);
      const created = await createRecipe({
        title: cleanTitle,
        category,
        durationMin: Math.max(1, Number(durationMin) || 1),
        servings: Math.max(1, Number(servings) || 1),
        calories: Math.max(0, Number(calories) || 0),
        tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
        ingredients: cleanIngredients,
        steps: cleanSteps,
      });

      router.replace({
        pathname: '/recipes/[id]',
        params: { id: created.id },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tarif kaydedilemedi.';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={COLORS.primary} strokeWidth={2.4} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Tarif Ekle</Text>
            <Text style={styles.headerSub}>Kendi tarifini oluştur</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardPurple]}>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Protein Kahvaltı Kasesi"
            style={styles.input}
          />

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((item) => {
              const active = item === category;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.categoryItem, active && styles.categoryItemActive]}>
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.row}>
            <TextInput value={durationMin} onChangeText={setDurationMin} keyboardType="number-pad" style={[styles.input, styles.smallInput]} placeholder="Süre (dk)" />
            <TextInput value={servings} onChangeText={setServings} keyboardType="number-pad" style={[styles.input, styles.smallInput]} placeholder="Porsiyon" />
            <TextInput value={calories} onChangeText={setCalories} keyboardType="number-pad" style={[styles.input, styles.smallInput]} placeholder="Kalori" />
          </View>
        </View>

        <View style={[styles.card, styles.cardGreen]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            <Pressable style={styles.addBtn} onPress={() => setIngredients((prev) => [...prev, ''])}>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addBtnText}>Ekle</Text>
            </Pressable>
          </View>
          {ingredients.map((ingredient, idx) => (
            <TextInput
              key={`ingredient-${idx}`}
              value={ingredient}
              onChangeText={(value) => updateList(ingredients, setIngredients, idx, value)}
              placeholder={`Malzeme ${idx + 1}`}
              style={styles.input}
            />
          ))}
        </View>

        <View style={[styles.card, styles.cardYellow]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hazırlanışı</Text>
            <Pressable style={[styles.addBtn, { backgroundColor: COLORS.yellow }]} onPress={() => setSteps((prev) => [...prev, ''])}>
              <Plus size={16} color={COLORS.primary} />
              <Text style={[styles.addBtnText, { color: COLORS.primary }]}>Ekle</Text>
            </Pressable>
          </View>
          {steps.map((step, idx) => (
            <TextInput
              key={`step-${idx}`}
              value={step}
              onChangeText={(value) => updateList(steps, setSteps, idx, value)}
              placeholder={`Adım ${idx + 1}`}
              style={[styles.input, styles.multiline]}
              multiline
            />
          ))}
        </View>

        <View style={[styles.card, styles.cardBlue]}>
          <Text style={styles.sectionTitle}>Etiketler (virgülle ayır)</Text>
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="Protein, Vegan, Omega-3"
            style={styles.input}
          />
        </View>

        <View style={styles.footerActions}>
          <Pressable style={[styles.footerBtn, styles.cancelBtn]} onPress={() => router.back()}>
            <Text style={[styles.footerBtnText, { color: COLORS.primary }]}>İptal</Text>
          </Pressable>
          <Pressable
            style={[styles.footerBtn, styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={[styles.footerBtnText, { color: COLORS.white }]}>
              {saving ? 'Kaydediliyor...' : 'Tarifi Kaydet'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EDEAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: 15,
    color: '#4E535F',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  cardPurple: {
    backgroundColor: COLORS.purpleSoft,
    borderColor: 'rgba(201, 195, 234, 0.55)',
  },
  cardBlue: {
    backgroundColor: '#EAF3FF',
    borderColor: 'rgba(90, 151, 240, 0.35)',
  },
  cardGreen: {
    backgroundColor: '#EEF5DE',
    borderColor: 'rgba(168, 200, 90, 0.35)',
  },
  cardYellow: {
    backgroundColor: '#FFF4DA',
    borderColor: 'rgba(242, 207, 123, 0.42)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E2F0',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 16,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  smallInput: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexGrow: 1,
    minWidth: '47%',
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#5B6070',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.green,
    borderRadius: 18,
    height: 36,
    paddingHorizontal: 12,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  multiline: {
    minHeight: 90,
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ECE9F6',
  },
  saveBtn: {
    backgroundColor: COLORS.green,
  },
  footerBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
