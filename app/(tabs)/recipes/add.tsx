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
import {
  createRecipe,
  mapCategoryToBackend,
} from '@/lib/recipesApi';

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
  orange: '#FF6B1A',
};

type DisplayCategory = 'Kahvaltı' | 'Öğle' | 'Akşam' | 'Atıştırma';
const CATEGORIES: DisplayCategory[] = ['Kahvaltı', 'Öğle', 'Akşam', 'Atıştırma'];

export default function AddRecipeScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DisplayCategory>('Kahvaltı');
  const [durationMin, setDurationMin] = useState('30');
  const [servings, setServings] = useState('2');
  const [calories, setCalories] = useState('450');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<
    Array<{ name: string; amountText: string }>
  >([{ name: '', amountText: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [tags, setTags] = useState('Protein, Lif');
  const [tip, setTip] = useState('');
  const [saving, setSaving] = useState(false);

  const updateIngredient = (
    index: number,
    field: 'name' | 'amountText',
    value: string,
  ) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: value };
    setIngredients(next);
  };

  const handleSave = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert('Uyarı', 'Tarif adı zorunlu.');
      return;
    }

    const cleanIngredients = ingredients.filter((i: { name: string; }) => i.name.trim());
    const cleanSteps = steps
      .map((s) => s.trim())
      .filter(Boolean)
      .map((step) => ({ text: step }));

    if (cleanIngredients.length === 0 || cleanSteps.length === 0) {
      Alert.alert('Uyarı', 'En az 1 malzeme ve 1 adım gir.');
      return;
    }

    try {
      setSaving(true);
      const created = await createRecipe({
        title: cleanTitle,
        description: description.trim() || undefined,
        category: mapCategoryToBackend(category),
        prepTimeMin: Math.max(1, Number(durationMin) || 1),
        servings: Math.max(1, Number(servings) || 1),
        caloriesKcal: Math.max(0, Number(calories) || 0),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        tip: tip.trim() || undefined,
        ingredients: cleanIngredients.map((i: { name: string; amountText: string; }) => ({
          name: i.name.trim(),
          amountText: i.amountText.trim(),
        })),
        steps: cleanSteps,
      });

      router.replace({
        pathname: '/recipes/[id]',
        params: { id: created.id },
      });
    } catch (error) {
      console.log('CREATE_RECIPE_ERROR', error);
      const message =
        error instanceof Error ? error.message : 'Tarif kaydedilemedi.';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
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
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Kısa açıklama (opsiyonel)"
            style={[styles.input, styles.multiline]}
            multiline
          />

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((item) => {
              const active = item === category;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryItem,
                    active && styles.categoryItemActive,
                  ]}>
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.row}>
            <TextInput
              value={durationMin}
              onChangeText={setDurationMin}
              keyboardType="number-pad"
              style={[styles.input, styles.smallInput]}
              placeholder="Süre (dk)"
            />
            <TextInput
              value={servings}
              onChangeText={setServings}
              keyboardType="number-pad"
              style={[styles.input, styles.smallInput]}
              placeholder="Porsiyon"
            />
            <TextInput
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              style={[styles.input, styles.smallInput]}
              placeholder="Kalori"
            />
          </View>
        </View>

        <View style={[styles.card, styles.cardGreen]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            <Pressable
              style={styles.addBtn}
              onPress={() =>
                setIngredients((prev: any) => [
                  ...prev,
                  { name: '', amountText: '' },
                ])
              }>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addBtnText}>Ekle</Text>
            </Pressable>
          </View>
          {ingredients.map((ingredient: { name: string | undefined; amountText: string | undefined; }, idx: number) => (
            <View key={`ingredient-${idx}`} style={styles.ingredientRow}>
              <TextInput
                value={ingredient.name}
                onChangeText={(val) => updateIngredient(idx, 'name', val)}
                placeholder={`Malzeme ${idx + 1}`}
                style={[styles.input, { flex: 2 }]}
              />
              <TextInput
                value={ingredient.amountText}
                onChangeText={(val) =>
                  updateIngredient(idx, 'amountText', val)
                }
                placeholder="Miktar"
                style={[styles.input, { flex: 1 }]}
              />
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.cardYellow]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hazırlanışı</Text>
            <Pressable
              style={[styles.addBtn, { backgroundColor: COLORS.yellow }]}
              onPress={() => setSteps((prev) => [...prev, ''])}>
              <Plus size={16} color={COLORS.primary} />
              <Text style={[styles.addBtnText, { color: COLORS.primary }]}>
                Ekle
              </Text>
            </Pressable>
          </View>
          {steps.map((step, idx) => (
            <TextInput
              key={`step-${idx}`}
              value={step}
              onChangeText={(value) => {
                const next = [...steps];
                next[idx] = value;
                setSteps(next);
              }}
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
          <TextInput
            value={tip}
            onChangeText={setTip}
            placeholder="İpucu (opsiyonel)"
            style={[styles.input, styles.multiline]}
            multiline
          />
        </View>

        <View style={styles.footerActions}>
          <Pressable
            style={[styles.footerBtn, styles.cancelBtn]}
            onPress={() => router.back()}>
            <Text style={[styles.footerBtnText, { color: COLORS.primary }]}>
              İptal
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.footerBtn,
              styles.saveBtn,
              saving && { opacity: 0.7 },
            ]}
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
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#EDEAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: 13,
    color: '#4E535F',
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E2F0',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  ingredientRow: {
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
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
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
    borderRadius: 16,
    height: 34,
    paddingHorizontal: 12,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  multiline: {
    minHeight: 76,
    height: 76,
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
    height: 46,
    borderRadius: 17,
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
    fontSize: 14,
    fontWeight: '800',
  },
});