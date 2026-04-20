import { View, Text, StyleSheet } from 'react-native';

type Stage =
  | 'validator'
  | 'segmenter'
  | 'pose'
  | 'warp'
  | 'composite'
  | 'quality';

interface StageIndicatorProps {
  currentStage: Stage;
  completedStages: Stage[];
}

const STAGES: { key: Stage; label: string }[] = [
  { key: 'validator', label: 'Validator' },
  { key: 'segmenter', label: 'Segmenter' },
  { key: 'pose', label: 'Pose' },
  { key: 'warp', label: 'Warp' },
  { key: 'composite', label: 'Composite' },
  { key: 'quality', label: 'Quality' },
];

export default function StageIndicator({
  currentStage,
  completedStages,
}: StageIndicatorProps) {
  return (
    <View style={styles.container}>
      {STAGES.map((stage, index) => {
        const isCompleted = completedStages.includes(stage.key);
        const isCurrent = stage.key === currentStage && !isCompleted;
        const isUpcoming = !isCompleted && !isCurrent;

        return (
          <View key={stage.key} style={styles.stageItem}>
            <View
              style={[
                styles.circle,
                isCompleted && styles.circleCompleted,
                isCurrent && styles.circleCurrent,
                isUpcoming && styles.circleUpcoming,
              ]}
            >
              {isCompleted ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.circleText,
                    isCurrent && styles.circleTextCurrent,
                    isUpcoming && styles.circleTextUpcoming,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.label,
                isCompleted && styles.labelCompleted,
                isCurrent && styles.labelCurrent,
                isUpcoming && styles.labelUpcoming,
              ]}
              numberOfLines={1}
            >
              {stage.label}
            </Text>
            {index < STAGES.length - 1 && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circleCompleted: {
    backgroundColor: '#4caf50',
  },
  circleCurrent: {
    backgroundColor: '#1a1a1a',
  },
  circleUpcoming: {
    backgroundColor: '#e0e0e0',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  circleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  circleTextCurrent: {
    color: '#ffffff',
  },
  circleTextUpcoming: {
    color: '#aaaaaa',
  },
  label: {
    fontSize: 10,
    color: '#888888',
    marginTop: 6,
    textAlign: 'center',
  },
  labelCompleted: {
    color: '#4caf50',
  },
  labelCurrent: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  labelUpcoming: {
    color: '#bbbbbb',
  },
  connector: {
    position: 'absolute',
    top: 18,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#e0e0e0',
    zIndex: 0,
  },
  connectorCompleted: {
    backgroundColor: '#4caf50',
  },
});