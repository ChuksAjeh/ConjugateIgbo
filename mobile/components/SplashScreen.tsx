import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  const WavePattern = ({ side }: { side: 'left' | 'right' }) => {
    const waves = [];
    const waveHeight = 30;
    const numWaves = Math.ceil(height / waveHeight);

    for (let i = 0; i < numWaves; i++) {
      const y = i * waveHeight;
      waves.push(
        <Path
          key={`wave-${i}`}
          d={side === 'left'
            ? `M 0 ${y} L 10 ${y + 10} L 0 ${y + 20}`
            : `M 20 ${y} L 10 ${y + 10} L 20 ${y + 20}`}
          fill="none"
          stroke="#8B0000"
          strokeWidth="2.5"
          opacity="0.4"
        />
      );
    }

    return (
      <Svg height={height} width="20" style={StyleSheet.absoluteFill}>
        {waves}
      </Svg>
    );
  };

  const HexagonLogo = () => {
    return (
      <Svg width="140" height="160" viewBox="0 0 140 160">
        <Polygon
          points="70,10 130,45 130,115 70,150 10,115 10,45"
          fill="#1ABC9C"
        />
        <Path
          d="M 45 55 Q 45 48, 52 48 L 88 48 Q 95 48, 95 55 L 95 85 Q 95 95, 88 95 L 52 95 Q 45 95, 45 85 Z"
          fill="#AD1102"
        />
        <Path
          d="M 58 63 L 62 60 L 62 70 L 58 73 Z M 70 63 L 74 60 L 74 70 L 70 73 Z"
          fill="#6B0000"
        />
      </Svg>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.waveLeft}>
        <WavePattern side="left" />
      </View>

      <View style={styles.waveRight}>
        <WavePattern side="right" />
      </View>

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <HexagonLogo />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Conjugate</Text>
          <Text style={styles.subtitle}>IGBO</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AD1102',
    position: 'relative',
  },
  waveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
  },
  waveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 46,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 46,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    marginTop: -5,
  },
});
