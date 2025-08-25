import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check } from 'lucide-react-native';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { createStyles } from './proStyles';
import { useMemo } from 'react';

export default function ProScreen() {
  const { theme, isDark } = useTheme();
  const { isProUser, isLoading, purchasePro, restorePurchases } = usePurchases();
  const styles = createStyles(theme, isDark);

  const handlePurchase = async () => {
    try {
      const success = await purchasePro();
      if (success) {
        Alert.alert(
          'Purchase Successful!',
          'Welcome to Conjugate Igbo Pro! All features are now unlocked.',
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Purchase Failed',
          'Something went wrong with your purchase. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Purchase Error',
        'Unable to complete purchase. Please check your connection and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(
          'Purchases Restored!',
          'Your Pro features have been restored successfully.',
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any previous purchases to restore.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // If user is already pro, show a different screen
  if (isProUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={isDark ? ['#059669', '#047857'] : ['#10b981', '#059669']}
            style={styles.header}
          >
            <Crown size={48} color="white" />
            <Text style={styles.headerTitle}>You're Pro!</Text>
            <Text style={styles.headerSubtitle}>
              All features unlocked
            </Text>
          </LinearGradient>

          <View style={[styles.proStatusContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.proStatusTitle, { color: theme.colors.text }]}>Pro Features Active</Text>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Check size={20} color="#10b981" />
              </View>
              <Text style={[styles.featureText, { color: theme.colors.text }]}>Access to 1000+ premium verbs</Text>
            </View>
          </View>

          <View style={[styles.thankYouContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.thankYouText, { color: theme.colors.text }]}>
              Thank you for supporting Igbo language learning! 🎉
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Create cat illustration with pattern background


  const createPatternBackground = () => {
    const { width, height } = Dimensions.get('window');

    return useMemo(() => {
      const patterns = [];
      const patternSize = 40;
      const spacing = 60;
      const maxElements = 100; // Prevent too many elements

      const cols = Math.min(Math.ceil(width / spacing) + 1, Math.ceil(Math.sqrt(maxElements)));
      const rows = Math.min(Math.ceil((height * 0.4) / spacing) + 1, Math.ceil(maxElements / cols));

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing - spacing / 2;
          const y = row * spacing - spacing / 2;

          patterns.push(
            <View
              key={`${row}-${col}`}
              style={[
                styles.patternElement,
                {
                  left: x,
                  top: y,
                  width: patternSize,
                  height: patternSize,
                },
              ]}
            >
              <Text style={styles.patternIcon}>🦁</Text>
            </View>
          );
        }
      }
      return patterns;
    }, []);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Section with Cat and Pattern */}
        <LinearGradient
          colors={['#fb923c', '#f97316']}
          style={styles.topSection}
        >
          <View style={styles.patternContainer}>
            {createPatternBackground()}
          </View>
          
          {/* Cat Illustration */}
          <View style={styles.catContainer}>
            <View style={styles.catCircle}>
              <LinearGradient
                colors={['#dc2626', '#fbbf24']}
                style={styles.catBackground}
              >
                <View style={styles.cat}>
                  <View style={styles.catEars}>
                    <View style={styles.catEar} />
                    <View style={styles.catEar} />
                  </View>
                  <View style={styles.catFace}>
                    <View style={styles.catEyes}>
                      <View style={styles.catEye} />
                      <View style={styles.catEye} />
                    </View>
                    <View style={styles.catMouth}>
                      <View style={styles.catTongue} />
                    </View>
                  </View>
                  <View style={styles.catBody} />
                  <View style={styles.catTail} />
                </View>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        {/* Bottom Section with Content */}
        <View style={styles.bottomSection}>
          <Text style={styles.mainTitle}>Master your Igbo with</Text>
          <Text style={styles.brandTitle}>ConjuGato Pro</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>1000 verbs</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>18 tenses in 3 moods</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>over 100 rhyme cards</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.buyButton, isLoading && styles.buyButtonDisabled]} 
            onPress={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buyButtonText}>Buy Now</Text>
            )}
          </TouchableOpacity>

          <View style={styles.pricingInfo}>
            <Text style={styles.priceText}>£7.49 one-time</Text>
            <Text style={styles.subscriptionText}>No subscriptions!</Text>
          </View>

          <TouchableOpacity 
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
          >
            <Text style={styles.restoreButtonText}>Restore your purchase</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}