import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.appName}>FitCheck</Text>
          <Text style={styles.tagline}>AI-Powered Virtual Try-On</Text>
          <View style={styles.illustration}>
            <View style={styles.illustrationIcon}>
              <Text style={styles.iconEmoji}>👗</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.8}
          onPress={() => router.push('/upload')}
        >
          <Text style={styles.ctaButtonText}>Try It On</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 64,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  illustration: {
    marginTop: 48,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eeeeee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 40,
  },
  ctaButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});