import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import * as Sentry from '@sentry/react-native';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { usePurchases } from '@/hooks/usePurchases';
import { ICON_IMAGE } from '@/components/SplashScreen';

const { width, height } = Dimensions.get('window');

const SPACING_X = 120;
const SPACING_Y = 140;
const PATTERN_COLOR = '#D47C3C';
const PATTERN_OPACITY = 0.35;

// Period vector for seamless scrolling (6 units of the lattice to match (row + col) % 3 and row offsets)
// Moving up and to the left by this vector returns the lattice to its original state
const PERIOD_X = 360; // 6 * 60 (half spacing)
const PERIOD_Y = 840; // 6 * 140

type PatternElementType =
  | 'hexagon'
  | 'doubleChevron'
  | 'dot';

interface PatternElement {
  type: PatternElementType;
  x: number;
  y: number;
  rotation: number;
  size: number;
}

// Generate pattern elements for a single large tile that covers screen + scroll area
const generatePatternElements = (): PatternElement[] => {
  const elements: PatternElement[] = [];

  // Cover screen plus the area we scroll into
  const numRows = Math.ceil((height + PERIOD_Y) / SPACING_Y) + 4;
  const numCols = Math.ceil((width + PERIOD_X) / SPACING_X) + 4;

  for (let row = -2; row < numRows; row++) {
    for (let col = -2; col < numCols; col++) {
      // Offset every other row for diagonal lattice
      const x = col * SPACING_X + (row % 2) * (SPACING_X / 2);
      const y = row * SPACING_Y;

      // Use absolute values to avoid negative modulo issues
      const patternIndex = Math.abs(row + col) % 3;

      let type: PatternElementType;
      let size: number;
      let rotation: number;

      switch (patternIndex) {
        case 0:
          type = 'hexagon';
          size = 50;
          rotation = 0;
          break;
        case 1:
          type = 'doubleChevron';
          size = 35;
          rotation = -45; // Diagonal orientation
          break;
        case 2:
          type = 'hexagon';
          size = 45;
          rotation = 0;
          break;
        default:
          type = 'dot';
          size = 5;
          rotation = 0;
      }

      elements.push({ type, x, y, rotation, size });

      // Add scattered dots to match polys.png density
      if (patternIndex !== 2) {
        elements.push({
          type: 'dot',
          x: x + SPACING_X * 0.4,
          y: y + SPACING_Y * 0.3,
          rotation: 0,
          size: 4,
        });
      }
    }
  }

  return elements;
};

// Animated diagonal scrolling background pattern
const AnimatedDiagonalPattern = () => {
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const patternElements = useMemo(() => generatePatternElements(), []);

  useEffect(() => {
    // Single animated value 0 -> 1 for both X and Y
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 30000, // Very slow ambient scroll
        useNativeDriver: true,
      }),
    ).start();
  }, [scrollAnim]);

  // Interpolate for diagonal movement
  const translateX = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -PERIOD_X],
  });

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -PERIOD_Y],
  });

  // Render a hexagon outline
  const renderHexagon = (x: number, y: number, size: number, key: string) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      points.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
    }
    points.push('Z');

    return (
      <Path
        key={key}
        d={points.join(' ')}
        stroke={PATTERN_COLOR}
        strokeWidth={2.5}
        fill="none"
        opacity={PATTERN_OPACITY}
      />
    );
  };

  // Render double chevron (>> shape)
  const renderDoubleChevron = (
    x: number,
    y: number,
    size: number,
    rotation: number,
    key: string,
  ) => {
    const chevronWidth = size * 0.4;
    const chevronHeight = size;
    const gap = size * 0.25;

    const chevron1 = `
      M ${x - gap / 2} ${y - chevronHeight / 2}
      L ${x - gap / 2 - chevronWidth} ${y}
      L ${x - gap / 2} ${y + chevronHeight / 2}
    `;

    const chevron2 = `
      M ${x + gap / 2 + chevronWidth} ${y - chevronHeight / 2}
      L ${x + gap / 2} ${y}
      L ${x + gap / 2 + chevronWidth} ${y + chevronHeight / 2}
    `;

    return (
      <G
        key={key}
        opacity={PATTERN_OPACITY}
        transform={`rotate(${rotation}, ${x}, ${y})`}
      >
        <Path
          d={chevron1}
          stroke={PATTERN_COLOR}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={chevron2}
          stroke={PATTERN_COLOR}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    );
  };

  // Render zig-zag connecting lines
  const renderZigZags = () => {
    const lines = [];
    const stepX = 30;
    const stepY = 70; // PERIOD_Y (840) is multiple of 70

    // Cover the visible area plus the scroll buffer
    for (let x = -SPACING_X; x < width + PERIOD_X; x += SPACING_X) {
      let path = `M ${x} ${-PERIOD_Y}`;
      for (let y = -PERIOD_Y; y < height + PERIOD_Y; y += stepY) {
        const xOffset = (Math.abs(Math.floor(y / stepY)) % 2) * stepX;
        path += ` L ${x + xOffset} ${y}`;
      }
      lines.push(
        <Path
          key={`zigzag-${x}`}
          d={path}
          stroke={PATTERN_COLOR}
          strokeWidth={2}
          fill="none"
          opacity={PATTERN_OPACITY * 0.5}
        />,
      );
    }
    return lines;
  };

  return (
    <View style={styles.diagonalPatternContainer}>
      <Animated.View
        style={{
          transform: [{ translateX }, { translateY }],
        }}
      >
        <Svg height={height + PERIOD_Y + 100} width={width + PERIOD_X + 100}>
          {renderZigZags()}
          {patternElements.map((element, index) => {
            const { type, x, y, size, rotation } = element;
            const key = `el-${index}`;

            switch (type) {
              case 'hexagon':
                return renderHexagon(x, y, size, key);
              case 'doubleChevron':
                return renderDoubleChevron(x, y, size, rotation, key);
              case 'dot':
                return (
                  <Circle
                    key={key}
                    cx={x}
                    cy={y}
                    r={size}
                    fill={PATTERN_COLOR}
                    opacity={PATTERN_OPACITY}
                  />
                );
              default:
                return null;
            }
          })}
        </Svg>
      </Animated.View>
    </View>
  );
};

export default function ProScreen() {
  const { isProUser, hasLoaded, packages, purchasePro, restorePurchases } =
    usePurchases();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  // Get the price string from RevenueCat offerings
  const priceString = React.useMemo(() => {
    const proPackage = packages.find(
      (p) =>
        p.product.identifier === 'conjugate_igbo_pro' ||
        p.packageType === 'LIFETIME' ||
        p.identifier === 'lifetime' ||
        p.identifier === 'pro',
    );
    return proPackage?.product?.priceString || null;
  }, [packages]);

  // No longer redirecting Pro users out, let them see their status

  const handlePurchase = useCallback(async () => {
    if (isProUser || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const success = await purchasePro();
      if (success) {
        Alert.alert(
          'Purchase Successful!',
          'Thank you for upgrading to Pro! You now have access to all features.',
          [
            {
              text: 'Start Practicing',
              onPress: () => router.replace('/(tabs)'),
            },
          ],
        );
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'pro', screen: 'ProScreen' },
        extra: { context: 'Purchase failed' },
      });
      Alert.alert('Purchase Error', 'Unable to complete purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  }, [isProUser, isPurchasing, purchasePro, router]);

  const handleRestore = useCallback(async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(
          'Purchases Restored!',
          'Your Pro features have been restored successfully.',
          [{ text: 'Great!', style: 'default' }],
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find any previous purchases to restore.",
          [{ text: 'OK', style: 'default' }],
        );
      }
    } catch {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again later.',
        [{ text: 'OK', style: 'default' }],
      );
    }
  }, [restorePurchases]);

  // Features list
  const features = [
    '1000+ Verbs',
    'All tenses',
    'Multiple dialects of Igbo',
    'Can set daily goals',
  ];

  // If still loading initially, show spinner
  if (!hasLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F3703E" />
      </View>
    );
  }

  // If user is Pro (should redirect, but just in case)
  if (isProUser) {
    return (
      <SafeAreaView style={styles.proUserContainer}>
        <View style={styles.proUserContent}>
          <Text style={styles.proUserTitle}>You are a Pro!</Text>
          <Text style={styles.proUserSubtitle}>
            Thank you for supporting ConjugateIgbo.
          </Text>
          <TouchableOpacity
            style={styles.proUserButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.proUserButtonText}>Start Practicing</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Diagonal Background Pattern */}
      <AnimatedDiagonalPattern />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Container */}
          <View style={styles.cardContainer}>
            {/* Logo overlapping the card */}
            <View style={styles.logoContainer}>
              <Image
                source={ICON_IMAGE}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Card */}
            <View style={styles.card}>
              {/* Title */}
              <Text style={styles.cardTitle}>GO DEEPER WITH IGBO!</Text>

              {/* Features List */}
              <View style={styles.featuresList}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureText}>{feature}</Text>
                    <Check size={24} color="#F3703E" strokeWidth={3} />
                  </View>
                ))}
              </View>

              {/* Purchase Button */}
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  isPurchasing && styles.purchaseButtonDisabled,
                ]}
                onPress={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.purchaseButtonText}>Upgrade to Pro</Text>
                )}
              </TouchableOpacity>

              {/* Pricing Info */}
              <View style={styles.pricingContainer}>
                {priceString ? (
                  <>
                    <Text style={styles.priceText}>
                      <Text style={styles.priceAmount}>{priceString}</Text>
                      {' '}Unlock everything forever!
                    </Text>
                    <Text style={styles.noSubscriptionText}>No subscriptions.</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.priceSkeleton} />
                    <Text style={styles.noSubscriptionText}>Loading price...</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Restore Purchases */}
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Diagonal Background Pattern
  diagonalPatternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  // Card
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  logoContainer: {
    zIndex: 2,
    marginBottom: -60,
  },
  logo: {
    width: 140,
    height: 140,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#F3703E',
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 25,
    width: '100%',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 26,
    fontFamily: 'Manjari-Bold',
    color: '#F3703E',
    textAlign: 'center',
    marginBottom: 25,
  },
  // Features
  featuresList: {
    width: '100%',
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureText: {
    fontSize: 18,
    fontFamily: 'Manjari-Regular',
    color: '#4A4A4A',
    flex: 1,
  },
  // Purchase Button
  purchaseButton: {
    backgroundColor: '#F3703E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Manjari-Bold',
  },
  // Pricing
  pricingContainer: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Manjari-Regular',
    color: '#666',
    textAlign: 'center',
  },
  priceAmount: {
    fontFamily: 'Manjari-Bold',
    color: '#4A4A4A',
  },
  noSubscriptionText: {
    fontSize: 14,
    fontFamily: 'Manjari-Regular',
    color: '#666',
    marginTop: 2,
  },
  priceSkeleton: {
    width: 150,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  // Restore
  restoreButton: {
    paddingVertical: 15,
    marginTop: 10,
    zIndex: 10,
  },
  restoreButtonText: {
    fontSize: 16,
    fontFamily: 'Manjari-Regular',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
  // Pro User (already purchased)
  proUserContainer: {
    flex: 1,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  proUserContent: {
    alignItems: 'center',
  },
  proUserTitle: {
    fontSize: 28,
    fontFamily: 'Manjari-Bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  proUserSubtitle: {
    fontSize: 16,
    fontFamily: 'Manjari-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 30,
    textAlign: 'center',
  },
  proUserButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  proUserButtonText: {
    fontSize: 18,
    fontFamily: 'Manjari-Bold',
    color: '#10b981',
  },
});
