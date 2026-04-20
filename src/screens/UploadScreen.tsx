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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/api';

export default function UploadScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
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
      setImageUri(result.assets[0].uri);
      setError(null);
    }
  };

  const validateImage = (uri: string | null): boolean => {
    if (!uri) return false;
    return true;
  };

  const handleNext = async () => {
    if (!imageUri) return;

    setUploading(true);
    setError(null);

    try {
      const response = await uploadImage(imageUri);
      router.push({
        pathname: '/garment',
        params: { person_asset_id: response.asset_id },
      });
    } catch (err) {
      setError('Failed to upload image. Please try again.');
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
        <Text style={styles.stepText}>Step 1 of 2</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Upload Your Photo</Text>
        <Text style={styles.subtitle}>
          Stand in front of a plain background, full body visible
        </Text>

        <TouchableOpacity
          style={styles.pickerButton}
          activeOpacity={0.7}
          onPress={pickImage}
        >
          {imageUri ? (
            <View style={styles.previewContainer}>
              <View style={styles.imagePlaceholder}>
                <Text style={styles.previewText}>Photo Selected</Text>
              </View>
            </View>
          ) : (
            <View style={styles.pickerContent}>
              <Text style={styles.pickerIcon}>📷</Text>
              <Text style={styles.pickerText}>Select Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity
            style={styles.changeButton}
            onPress={pickImage}
          >
            <Text style={styles.changeButtonText}>Change Photo</Text>
          </TouchableOpacity>
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
            <Text style={styles.nextButtonText}>Next</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
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
  pickerButton: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  pickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '500',
  },
  changeButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
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
  nextButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});