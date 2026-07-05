import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function SkeletonCard() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Animated.View style={[styles.titleBar, { opacity }]} />
        <Animated.View style={[styles.lineBar, { opacity }]} />
        <Animated.View style={[styles.lineBarShort, { opacity }]} />
        <View style={styles.metaRow}>
          <Animated.View style={[styles.metaBar, { opacity }]} />
          <Animated.View style={[styles.metaBarSmall, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  content: {
    gap: 8,
  },
  titleBar: {
    width: '60%',
    height: 18,
    borderRadius: 4,
    backgroundColor: '#2a2a4e',
  },
  lineBar: {
    width: '90%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#2a2a4e',
  },
  lineBarShort: {
    width: '45%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#2a2a4e',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaBar: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#2a2a4e',
  },
  metaBarSmall: {
    width: 50,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#2a2a4e',
  },
});
