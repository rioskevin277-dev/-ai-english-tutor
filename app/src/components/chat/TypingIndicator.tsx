import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
  elapsed?: boolean;
}

export default function TypingIndicator({ elapsed = true }: TypingIndicatorProps) {
  const [dot1] = useState(() => new Animated.Value(0));
  const [dot2] = useState(() => new Animated.Value(0));
  const [dot3] = useState(() => new Animated.Value(0));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Dot animation
  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ]),
      );
    };

    const anim1 = animate(dot1, 0);
    const anim2 = animate(dot2, 200);
    const anim3 = animate(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (!elapsed) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [elapsed]);

  const dotStyle = (dot: Animated.Value) => ({
    opacity: dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, dotStyle(dot1)]} />
          <Animated.View style={[styles.dot, dotStyle(dot2)]} />
          <Animated.View style={[styles.dot, dotStyle(dot3)]} />
        </View>
        <Text style={styles.text}>Analyzing your writing...</Text>
        {elapsedSeconds > 5 && (
          <Text style={styles.elapsed}>{elapsedSeconds}s</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  bubble: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
    marginHorizontal: 2,
  },
  text: {
    color: '#b0b0b0',
    fontSize: 13,
  },
  elapsed: {
    color: '#555',
    fontSize: 11,
    marginLeft: 8,
  },
});
