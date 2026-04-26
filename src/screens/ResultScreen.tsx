import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function ResultScreen() {
  const router = useRouter();
  const { composite_url } = useLocalSearchParams<{
    job_id: string;
    composite_url: string;
  }>();

  const hasResult = !!composite_url && composite_url.length > 0 && !composite_url.startsWith('mock://');

  const handleShare = async () => {
    if (!hasResult) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(composite_url);
      } else {
        Alert.alert('Sharing unavailable', 'Cannot share on this device.');
      }
    } catch {
      Alert.alert('Error', 'Failed to share image.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Look ✨</Text>
      </View>

      <View style={styles.content}>
        {hasResult ? (
          <Image
            source={{ uri: composite_url }}
            style={styles.resultImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🎉</Text>
            <Text style={styles.placeholderTitle}>Look Generated!</Text>
            <Text style={styles.placeholderText}>
              Your studio photo is ready. Real images will appear here once Higgsfield credits are active.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {hasResult && (
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <Text style={styles.shareButtonText}>Share This Look</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.tryAnotherButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/garment')}
        >
          <Text style={styles.tryAnotherText}>Try Another Outfit →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  resultImage: {
    width: width - 48,
    height: (width - 48) * 1.25,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  placeholderEmoji: { fontSize: 64 },
  placeholderTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  placeholderText: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  shareButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  tryAnotherButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  tryAnotherText: { color: '#1a1a1a', fontSize: 16, fontWeight: '600' },
  homeButton: { alignItems: 'center', paddingVertical: 12 },
  homeText: { fontSize: 15, color: '#aaaaaa', fontWeight: '500' },
});
