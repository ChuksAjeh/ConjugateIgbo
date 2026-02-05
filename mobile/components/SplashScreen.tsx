import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Polygon, G } from 'react-native-svg';
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';

const { width, height } = Dimensions.get('window');

const ZigzagPattern = ({ side }: { side: 'left' | 'right' }) => {
  const zigzagPath = [];
  const zigzagWidth = 10;
  const zigzagHeight = 20;
  const numZigzags = Math.ceil(height / zigzagHeight);

  for (let i = 0; i <= numZigzags; i++) {
    if (i === 0) {
      zigzagPath.push(`M ${side === 'left' ? 0 : 20} ${i * zigzagHeight}`);
    }
    zigzagPath.push(`L ${side === 'left' ? zigzagWidth : 20 - zigzagWidth} ${i * zigzagHeight + zigzagHeight / 2}`);
    zigzagPath.push(`L ${side === 'left' ? 0 : 20} ${(i + 1) * zigzagHeight}`);
  }

  return (
    <Svg height={height} width={20} style={styles.patternSvg}>
      <Path
        d={zigzagPath.join(' ')}
        fill="none"
        stroke="#8B0000"
        strokeWidth="2"
        opacity="0.5"
      />
    </Svg>
  );
};

const HexagonLogo = () => {
  return (
    <Svg width="140" height="180" viewBox="0 0 140 180">
      <Polygon
        points="70,15 125,47 125,112 70,145 15,112 15,47"
        fill="#1ABC9C"
      />

      <G transform="translate(70, 80)">
        <Path
          d="M -22 -20 Q -22 -28, -15 -28 L 15 -28 Q 22 -28, 22 -20 L 22 10 Q 22 18, 15 18 L -15 18 Q -22 18, -22 10 Z"
          fill="#AD1102"
        />

        <Path
          d="M -8 -10 L -4 -13 L -4 -3 L -8 0 Z"
          fill="#6B0000"
        />
        <Path
          d="M 4 -10 L 8 -13 L 8 -3 L 4 0 Z"
          fill="#6B0000"
        />
      </G>
    </Svg>
  );
};

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [fontsLoaded] = useFonts({
    AmaticSC_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

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
  }, [fadeAnim, scaleAnim, onFinish, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.waveLeft}>
        <ZigzagPattern side="left" />
      </View>

      <View style={styles.waveRight}>
        <ZigzagPattern side="right" />
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
  patternSvg: {
    position: 'absolute',
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
    marginBottom: 5,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'AmaticSC_700Bold',
  },
  subtitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'AmaticSC_700Bold',
    marginTop: -10,
  },
});
