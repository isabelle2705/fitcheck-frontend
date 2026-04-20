import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface StatusCardProps {
  stage: string;
  progress: string;
  eta: string | null;
  isActive: boolean;
}

export default function StatusCard({ stage, progress, eta, isActive }: StatusCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.card,
        isActive && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <View style={styles.stageRow}>
        <View style={[styles.indicator, isActive && styles.indicatorActive]} />
        <Text style={styles.stageName}>{stage}</Text>
      </View>
      <Text style={styles.progress}>{progress}</Text>
      {eta && <Text style={styles.eta}>Est. {eta}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 4,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  indicatorActive: {
    backgroundColor: '#4caf50',
  },
  stageName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  progress: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  eta: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
});