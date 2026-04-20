import { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import StageIndicator from '../components/StageIndicator';
import StatusCard from '../components/StatusCard';

type Stage =
  | 'validator'
  | 'segmenter'
  | 'pose'
  | 'warp'
  | 'composite'
  | 'quality';

interface StageInfo {
  label: string;
  eta: string | null;
}

export default function ProcessingScreen() {
  const router = useRouter();
  const { session_id, job_id } = useLocalSearchParams<{
    session_id: string;
    job_id: string;
  }>();

  const [currentStage, setCurrentStage] = useState<Stage>('validator');
  const [stages, setStages] = useState<Record<Stage, StageInfo>>({
    validator: { label: 'Validating', eta: null },
    segmenter: { label: 'Segmenting', eta: null },
    pose: { label: 'Analyzing Pose', eta: null },
    warp: { label: 'Warping Garment', eta: null },
    composite: { label: 'Compositing', eta: null },
    quality: { label: 'Quality Check', eta: null },
  });
  const [completed, setCompleted] = useState<Stage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!session_id) return;

    const ws = new WebSocket(`ws://localhost:3000/ws/${session_id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      setError('Connection error. Please try again.');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      ws.close();
    };
  }, [session_id]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'stage_update':
        setCurrentStage(data.stage as Stage);
        setStages((prev) => ({
          ...prev,
          [data.stage]: {
            ...prev[data.stage as Stage],
            label: data.label || prev[data.stage as Stage].label,
            eta: data.eta || null,
          },
        }));
        break;

      case 'stage_complete':
        setCompleted((prev) => [...prev, data.stage as Stage]);
        break;

      case 'job_complete':
        router.replace({
          pathname: '/result',
          params: {
            job_id,
            result_url: data.result_url || '',
            quality_score: String(data.quality_score || 0),
          },
        });
        break;

      case 'job_failed':
        setError(data.error || 'Processing failed. Please try again.');
        break;
    }
  };

  const handleRetry = () => {
    router.replace('/garment');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Processing Your Try-On</Text>
        <Text style={styles.subtitle}>This usually takes 10-20 seconds</Text>

        <StageIndicator
          currentStage={currentStage}
          completedStages={completed}
        />

        <View style={styles.statusContainer}>
          <StatusCard
            stage={stages[currentStage].label}
            progress={`Stage ${completed.length + 1} of 6`}
            eta={stages[currentStage].eta}
            isActive={!completed.includes(currentStage) && currentStage !== 'quality'}
          />
        </View>
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
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 48,
  },
  statusContainer: {
    marginTop: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});