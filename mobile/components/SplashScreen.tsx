import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from './ThemeProvider';

const { width, height } = Dimensions.get('window');
export const ICON_IMAGE = require('../assets/images/icon.png');
export const LOGO_IMAGE = require('../assets/images/logo.png');

export const SlantedBox = ({
  children,
  type,
  backgroundColor,
}: {
  children: React.ReactNode;
  type: 'conjugate' | 'igbo';
  backgroundColor?: string;
}) => {
  const [contentWidth, setContentWidth] = React.useState(0);
  const { theme, isDark } = useTheme();

  const actualBackgroundColor =
    backgroundColor || (isDark ? theme.colors.surface : '#CE3B3B');

  // Dimensions for the trapezoidal shapes based on the description
  // Conjugate: left top 10, right top 5 (slanted down to the right)
  // Igbo: left top 5, right top 5.5 (slanted slightly up to the right)

  const boxWidth = contentWidth + 20; // Slightly bigger than the word width
  const boxHeight = 70;

  let pathData = '';
  if (type === 'conjugate') {
    // Left side: top 0, bottom 70 (total 70)
    // Right side: top 17.5, bottom 52.5 (total 35) -> 70:35 is 10:5
    pathData = `M 0 0 L ${boxWidth} 17.5 L ${boxWidth} 52.5 L 0 70 Z`;
  } else {
    // Left side: top 6.36, bottom 63.64 (total 57.28)
    // Right side: top 0, bottom 63 (total 63) -> 57.28:63 is approx 5:5.5
    pathData = `M 0 6.36 L ${boxWidth} 0 L ${boxWidth} 63 L 0 63.64 Z`;
  }

  return (
    <View style={styles.slantedBoxContainer}>
      {contentWidth > 0 && (
        <Svg
          width={boxWidth}
          height={boxHeight}
          viewBox={`0 0 ${boxWidth} ${boxHeight}`}
          style={styles.slantedBoxSvg}
        >
          <Path d={pathData} fill={actualBackgroundColor} />
        </Svg>
      )}
      <View style={[styles.slantedBoxContent, { width: boxWidth || 'auto' }]}>
        <View onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}>
          {children}
        </View>
      </View>
    </View>
  );
};

export const WavePattern = ({
  side,
  customHeight,
  variant = 'polygon',
  color = '#D47C3C',
  opacity = 0.6,
}: {
  side: 'left' | 'right';
  customHeight?: number;
  variant?: 'polygon' | 'zigzag';
  color?: string;
  opacity?: number;
}) => {
  const waves = [];
  const waveHeight = variant === 'zigzag' ? 40 : 60;
  const displayHeight = customHeight || height;
  const numWaves = Math.ceil(displayHeight / waveHeight);
  const triangleWidth = variant === 'zigzag' ? 12 : 25;
  const triangleHeight = variant === 'zigzag' ? 24 : 40;

  const buffer = 10;
  const svgWidth = triangleWidth + buffer * 2;

  for (let i = 0; i < numWaves; i++) {
    const y = i * waveHeight;
    const peakX = side === 'left' ? triangleWidth + buffer : buffer;
    const baseX = side === 'left' ? buffer : triangleWidth + buffer;

    if (variant === 'polygon') {
      waves.push(
        <React.Fragment key={`wave-${i}`}>
          <Path
            d={`M ${baseX} ${y} L ${peakX} ${y + triangleHeight / 2} L ${baseX} ${y + triangleHeight} Z`}
            fill={color}
            opacity={opacity}
          />
          <Circle
            cx={peakX}
            cy={y + (waveHeight + triangleHeight) / 2}
            r="3.5"
            fill={color}
            opacity={opacity}
          />
        </React.Fragment>,
      );
    } else {
      // Zigzag variant
      waves.push(
        <React.Fragment key={`wave-${i}`}>
          <Path
            d={`M ${baseX} ${y} L ${peakX} ${y + triangleHeight / 2} L ${baseX} ${y + triangleHeight}`}
            stroke={color}
            strokeWidth={2}
            fill="none"
            opacity={opacity}
          />
          <Circle
            cx={peakX}
            cy={y + (waveHeight + triangleHeight) / 2}
            r="2.5"
            fill={color}
            opacity={opacity}
          />
        </React.Fragment>,
      );
    }
  }

  return (
    <Svg
      height={displayHeight}
      width={svgWidth}
      style={{ position: 'absolute', top: 0, [side]: -buffer }}
    >
      {waves}
    </Svg>
  );
};

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
          <Image source={ICON_IMAGE} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.textContainer}>
          <SlantedBox type="conjugate">
            <Text style={styles.title}>CONJUGATE</Text>
          </SlantedBox>
          <SlantedBox type="igbo">
            <Text style={styles.subtitle}>IGBO</Text>
          </SlantedBox>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000', // Deep red background
    position: 'relative',
  },
  waveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  waveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 0, // Removed margin to reduce space
  },
  logo: {
    width: 220,
    height: 220,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: -10, // Pull text up towards logo
  },
  slantedBoxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -2, // Pull blocks closer together
  },
  slantedBoxSvg: {
    position: 'absolute',
  },
  slantedBoxContent: {
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 54,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'AmaticSC-Bold',
  },
  subtitle: {
    fontSize: 54,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'AmaticSC-Bold',
  },
});
