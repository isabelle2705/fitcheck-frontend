import { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { WS_BASE } from '../services/api';

const STAGES = [
  'Analyzing your photo…',
  'Fitting garments to your body…',
  'Generating studio look…',
  'Adding finishing touches…',
];

export default function ProcessingScreen() {
  const router = useRouter();
  const { session_id, job_id } = useLocalSearchParams<{
    session_id: string;
    job_id: string;
  }>();

  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Spinning animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Cycle through stage labels every few seconds as visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (!session_id) return;

    const wsUrl = `${WS_BASE}/ws/${session_id}`;
    console.log('[ws] connecting to', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log('[ws] connected');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[ws] message:', data);

        switch (data.type) {
          case 'stage_update':
            // Map higgsfield stage to our UI stage index
            if (data.stage === 'generating') setStageIndex(2);
            break;

          case 'job_complete':
            router.replace({
              pathname: '/result',
              params: {
                job_id: job_id ?? '',
                composite_url: data.composite_url ?? '',
              },
            });
            break;

          case 'job_failed':
            setError(data.error ?? 'Generation failed. Please try again.');
            break;
        }
      } catch (err) {
        console.error('[ws] parse error:', err);
      }
    };

    ws.onerror = (e) => {
      console.error('[ws] error:', e);
      // Don't set error immediately — might reconnect
    };

    ws.onclose = () => console.log('[ws] closed');

    return () => ws.close();
  }, [session_id]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={() => router.replace('/garment')}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredContent}>
        {/* Spinner */}
        <Animated.Text style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          ✨
        </Animated.Text>

        <Text style={styles.title}>Creating Your Look</Text>
        <Text style={styles.subtitle}>This takes about 30–60 seconds</Text>

        <View style={styles.stageCard}>
          <Text style={styles.stageText}>{STAGES[stageIndex]}</Text>
        </View>

        <Text style={styles.hint}>
          We're generating a professional studio photo just for you
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  spinner: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#888888', textAlign: 'center' },
  stageCard: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  stageText: { fontSize: 15, fontWeight: '500', color: '#333333', textAlign: 'center' },
  hint: {
    fontSize: 13,
    color: '#aaaaaa',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  errorEmoji: { fontSize: 48, marginBottom: 8 },
  errorTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  errorMessage: { fontSize: 15, color: '#666666', textAlign: 'center', lineHeight: 22 },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  retryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
