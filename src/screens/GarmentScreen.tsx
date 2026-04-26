import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { generate } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { CATALOG, CATEGORIES, CatalogItem } from '../data/catalog';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48 - 12) / 2; // 2 columns with padding + gap

export default function GarmentScreen() {
  const router = useRouter();
  const { userId, points, setPoints } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = selectedCategory === 'all'
    ? CATALOG
    : CATALOG.filter((item) => item.category === selectedCategory);

  const toggleItem = (item: CatalogItem) => {
    setSelectedItems((prev) => {
      const already = prev.find((i) => i.id === item.id);
      if (already) return prev.filter((i) => i.id !== item.id);
      if (prev.length >= 3) return prev; // max 3 items
      return [...prev, item];
    });
  };

  const handleGenerate = async () => {
    if (!userId || selectedItems.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const garmentImageUrls = selectedItems.map((i) => i.imageUrl);
      const { generationId, pointsRemaining } = await generate(userId, garmentImageUrls);
      setPoints(pointsRemaining);

      router.push({
        pathname: '/processing',
        params: { session_id: userId, job_id: generationId },
      });
    } catch (err: any) {
      setError(err.message ?? 'Failed to start generation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (item: CatalogItem) => selectedItems.some((i) => i.id === item.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 2 of 2</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⚡ {points} pts</Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Pick Your Outfit</Text>
        <Text style={styles.subtitle}>
          Select up to 3 items to try on{selectedItems.length > 0 ? ` · ${selectedItems.length} selected` : ''}
        </Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Garment grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const selected = isSelected(item);
          return (
            <TouchableOpacity
              style={[styles.garmentCard, selected && styles.garmentCardSelected]}
              activeOpacity={0.8}
              onPress={() => toggleItem(item)}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.garmentImage}
                resizeMode="cover"
              />
              {selected && (
                <View style={styles.selectedOverlay}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                </View>
              )}
              <View style={styles.garmentInfo}>
                <Text style={styles.garmentName} numberOfLines={1}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Selected preview strip */}
      {selectedItems.length > 0 && (
        <View style={styles.selectionStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripContent}>
            {selectedItems.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => toggleItem(item)} style={styles.stripItem}>
                <Image source={{ uri: item.imageUrl }} style={styles.stripImage} />
                <View style={styles.stripRemove}>
                  <Text style={styles.stripRemoveText}>✕</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (selectedItems.length === 0 || loading) && styles.generateButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleGenerate}
          disabled={selectedItems.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.generateButtonText}>
              ✨ Generate Look
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#1a1a1a' },
  stepText: { fontSize: 14, color: '#888888', marginLeft: 12, flex: 1 },
  pointsBadge: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pointsText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  titleSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#888888', marginTop: 4 },
  categoriesScroll: { maxHeight: 48 },
  categoriesContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryChipActive: { backgroundColor: '#1a1a1a' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#666666' },
  categoryTextActive: { color: '#ffffff' },
  grid: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  row: { gap: 12, marginBottom: 12 },
  garmentCard: {
    width: ITEM_SIZE,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  garmentCardSelected: { borderColor: '#1a1a1a' },
  garmentImage: { width: '100%', height: ITEM_SIZE * 1.2 },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  garmentInfo: { paddingHorizontal: 10, paddingVertical: 8 },
  garmentName: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  selectionStrip: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
  },
  stripContent: { paddingHorizontal: 20, gap: 10 },
  stripItem: { position: 'relative' },
  stripImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#eeeeee' },
  stripRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripRemoveText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  errorContainer: { marginHorizontal: 24, marginBottom: 8, padding: 14, backgroundColor: '#fff0f0', borderRadius: 12 },
  errorText: { fontSize: 14, color: '#d32f2f', textAlign: 'center' },
  footer: { padding: 20, paddingBottom: 36 },
  generateButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  generateButtonDisabled: { backgroundColor: '#cccccc' },
  generateButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
});
