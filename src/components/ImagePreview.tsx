import { View, Image, StyleSheet } from 'react-native';

interface ImagePreviewProps {
  uri: string;
  type: 'person' | 'garment';
}

export default function ImagePreview({ uri, type }: ImagePreviewProps) {
  const aspectRatio = type === 'person' ? 2 / 3 : 1;

  return (
    <View style={[styles.container, { aspectRatio }]}>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});