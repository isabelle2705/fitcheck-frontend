import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { startTryon } from '../services/api';

export default function GarmentScreen() {
  const router = useRouter();
  const { person_asset_id } = useLocalSearchParams<{ person_asset_id: string }>();
  const [garmentUris, setGarmentUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickGarment = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGarmentUris([...garmentUris, result.assets[0].uri]);
      setError(null);
    }
  };

  const removeGarment = (index: number) => {
    setGarmentUris(garmentUris.filter((_, i) => i !== index));
  };

  const handleStartTryOn = async () => {
    if (!person_asset_id || garmentUris.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const response = await startTryon(person_asset_id, []);
      router.push({
        pathname: '/processing',
        params: {
          session_id: response.session_id,
          job_id: response.job_id,
        },
      });
    } catch (err) {
      setError('Failed to start try-on. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 2 of 2</Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Clothing</Text>
        <Text style={styles.subtitle}>
          Upload a clear photo of the item you want to try on
        </Text>

        <View style={styles.garmentGrid}>
          {garmentUris.map((uri, index) => (
            <View key={index} style={styles.garmentItem}>
              <View style={styles.garmentPreview}>
                <Text style={styles.garmentPreviewText}>Garment {index + 1}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeGarment(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.7}
            onPress={pickGarment}
          >
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add Garment</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            (garmentUris.length === 0 || uploading) && styles.startButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleStartTryOn}
          disabled={garmentUris.length === 0 || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.startButtonText}>Start Try-On</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
  stepText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 12,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 32,
  },
  garmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  garmentItem: {
    width: '47%',
    aspectRatio: 1,
    position: 'relative',
  },
  garmentPreview: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  garmentPreviewText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 36,
    color: '#888888',
    marginBottom: 4,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff0f0',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});