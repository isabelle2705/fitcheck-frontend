import { useEffect, useRef, useState, useCallback } from 'react';
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
import { WS_BASE, getResult } from '../services/api';

const STAGES = [
  'Analyzing your photo…',
  'Fitting garments to your body…',
  'Generating studio look…',
  'Adding finishing touches…',
];

const POLL_INTERVAL_MS = 3000;

export default function ProcessingScreen() {
  const router = useRouter();
  const { session_id, job_id } = useLocalSearchParams<{
    session_id: string;
    job_id: string;
  }>();

  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const doneRef = useRef(false);          // prevents double-navigation
  const spinAnim = useRef(new Animated.Value(0)).current;

  // ── helpers ────────────────────────────────────────────────────────────────

  const navigateToResult = useCallback(
    (compositeUrl: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      router.replace({
        pathname: '/result',
        params: { job_id: job_id ?? '', composite_url: compositeUrl },
      });
    },
    [job_id, router]
  );

  const handleFailure = useCallback((msg: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setError(msg);
  }, []);

  // ── spinning animation ─────────────────────────────────────────────────────

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

  // ── cycle stage labels ─────────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ── WebSocket (primary) ────────────────────────────────────────────────────

  useEffect(() => {
    if (!session_id) return;

    const wsUrl = `${WS_BASE}/ws/${session_id}`;
    console.log('[ws] connecting to', wsUrl);

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      console.warn('[ws] could not create WebSocket:', e);
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => console.log('[ws] connected');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        console.log('[ws] message:', data);

        switch (data.type) {
          case 'stage_update':
            if (data.stage === 'generating') setStageIndex(2);
            break;
          case 'job_complete':
            navigateToResult(data.composite_url ?? data.result_url ?? '');
            break;
          case 'job_failed':
            handleFailure(data.error ?? 'Generation failed. Please try again.');
            break;
        }
      } catch (err) {
        console.error('[ws] parse error:', err);
      }
    };

    ws.onerror = (e) => console.warn('[ws] error:', e);
    ws.onclose = () => console.log('[ws] closed');

    return () => ws.close();
  }, [session_id, navigateToResult, handleFailure]);

  // ── HTTP polling fallback ──────────────────────────────────────────────────

  useEffect(() => {
    if (!job_id) return;

    const poll = async () => {
      if (doneRef.current) return;
      try {
        const res = await getResult(job_id);
        console.log('[poll] result:', res.status);

        if (res.status === 'done' && res.composite_url) {
          navigateToResult(res.composite_url);
        } else if (res.status === 'failed') {
          const msg = res.error ?? res.issues?.[0] ?? 'Generation failed. Please try again.';
          handleFailure(msg);
        }
        // 'processing' → keep polling
      } catch (err: any) {
        console.warn('[poll] error:', err.message);
        // Network hiccup — keep polling
      }
    };

    // First poll after a short delay (job needs a moment to start)
    const timeout = setTimeout(poll, 2000);
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [job_id, navigateToResult, handleFailure]);

  // ── render ─────────────────────────────────────────────────────────────────

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
