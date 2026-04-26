import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, createUser, createSoulId } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function UploadScreen() {
  const router = useRouter();
  const { setUser, setSoulId } = useAppStore();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setError(null);
    }
  };

  const handleNext = async () => {
    if (!imageUri) return;
    setUploading(true);
    setError(null);

    try {
      // 1. Upload photo to R2
      setStatusText('Uploading your photo…');
      const { url: photoUrl } = await uploadImage(imageUri);

      // 2. Create user account
      setStatusText('Creating your profile…');
      const { id: userId, points } = await createUser();
      setUser(userId, points);

      // 3. Create Soul ID (Higgsfield character from photo)
      setStatusText('Building your AI model…');
      const { soulId } = await createSoulId(userId, [photoUrl]);
      setSoulId(soulId);

      // 4. Navigate to garment picker
      router.push('/garment');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
      setStatusText('');
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
        <Text style={styles.stepText}>Step 1 of 2</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Your Photo</Text>
        <Text style={styles.subtitle}>
          Full body shot works best — plain background, good lighting
        </Text>

        <TouchableOpacity
          style={styles.pickerButton}
          activeOpacity={0.7}
          onPress={pickImage}
          disabled={uploading}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.pickerContent}>
              <Text style={styles.pickerIcon}>📷</Text>
              <Text style={styles.pickerText}>Tap to select a photo</Text>
              <Text style={styles.pickerHint}>Full body, plain background</Text>
            </View>
          )}
        </TouchableOpacity>

        {imageUri && !uploading && (
          <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
            <Text style={styles.changeButtonText}>Change Photo</Text>
          </TouchableOpacity>
        )}

        {uploading && (
          <View style={styles.statusContainer}>
            <ActivityIndicator color="#1a1a1a" />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!imageUri || uploading) && styles.nextButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleNext}
          disabled={!imageUri || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.nextButtonText}>Next →</Text>
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
  stepText: { fontSize: 14, color: '#888888', marginLeft: 12 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#666666', lineHeight: 22, marginBottom: 28 },
  pickerButton: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  pickerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  pickerIcon: { fontSize: 44 },
  pickerText: { fontSize: 16, fontWeight: '600', color: '#555555' },
  pickerHint: { fontSize: 13, color: '#aaaaaa' },
  changeButton: { marginTop: 14, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  changeButtonText: { fontSize: 14, fontWeight: '600', color: '#555555' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  statusText: { fontSize: 14, color: '#555555' },
  errorContainer: { marginTop: 20, padding: 16, backgroundColor: '#fff0f0', borderRadius: 12 },
  errorText: { fontSize: 14, color: '#d32f2f', textAlign: 'center' },
  footer: { padding: 24, paddingBottom: 40 },
  nextButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#cccccc' },
  nextButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
});
