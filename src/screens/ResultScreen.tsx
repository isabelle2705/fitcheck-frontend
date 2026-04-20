import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import ImagePreview from '../components/ImagePreview';

export default function ResultScreen() {
  const router = useRouter();
  const { result_url, quality_score } = useLocalSearchParams<{
    result_url: string;
    quality_score: string;
  }>();

  const score = parseInt(quality_score || '0', 10);
  const hasValidResult = result_url && result_url.length > 0;

  const handleDownload = async () => {
    if (!hasValidResult) return;
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(result_url);
      } else {
        Alert.alert('Unavailable', 'Sharing is not available on this device.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to download image.');
    }
  };

  const handleShare = async () => {
    if (!hasValidResult) return;
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(result_url);
      } else {
        Alert.alert('Unavailable', 'Sharing is not available on this device.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to share image.');
    }
  };

  const handleTryAnother = () => {
    router.replace('/garment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Try-On Result</Text>

        <View style={styles.resultContainer}>
          {hasValidResult ? (
            <ImagePreview uri={result_url} type="person" />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderEmoji}>👗</Text>
              <Text style={styles.placeholderText}>Result preview</Text>
            </View>
          )}
        </View>

        {score > 0 && (
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <Text style={styles.scoreLabel}>Quality Score</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.downloadButton}
            activeOpacity={0.8}
            onPress={handleDownload}
          >
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.tryAnotherButton}
          activeOpacity={0.8}
          onPress={handleTryAnother}
        >
          <Text style={styles.tryAnotherButtonText}>Try Another →</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  placeholderContainer: {
    width: 240,
    height: 320,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888888',
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '400',
    color: '#aaaaaa',
    marginLeft: 2,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 32,
  },
  downloadButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  shareButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  tryAnotherButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  tryAnotherButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});