import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check } from 'lucide-react-native';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';

const { width, height } = Dimensions.get('window');

export default function ProScreen() {
  const { theme, isDark } = useTheme();
  const { isProUser, isLoading, purchasePro, restorePurchases } = usePurchases();

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
    const patterns = [];
    const patternSize = 40;
    const spacing = 60;
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil((height * 0.4) / spacing) + 1;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  content: {
    flex: 1,
  },
  topSection: {
    height: height * 0.5,
    position: 'relative',
    overflow: 'hidden',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  patternElement: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  catContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'white',
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  catBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 92,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cat: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  catEars: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: -10,
  },
  catEar: {
    width: 20,
    height: 25,
    backgroundColor: '#000',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    transform: [{ rotate: '15deg' }],
  },
  catFace: {
    width: 80,
    height: 70,
    backgroundColor: '#000',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  catEyes: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  catEye: {
    width: 12,
    height: 12,
    backgroundColor: '#fbbf24',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000',
  },
  catMouth: {
    marginTop: 8,
    alignItems: 'center',
  },
  catTongue: {
    width: 8,
    height: 6,
    backgroundColor: '#ec4899',
    borderRadius: 4,
  },
  catBody: {
    width: 60,
    height: 40,
    backgroundColor: '#000',
    borderRadius: 30,
    marginTop: -5,
  },
  catTail: {
    position: 'absolute',
    right: -25,
    top: 30,
    width: 40,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  bottomSection: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 40,
  },
  featuresList: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureBullet: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    marginRight: 16,
  },
  featureText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Inter-Regular',
  },
  buyButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  pricingInfo: {
    alignItems: 'center',
    marginBottom: 60,
  },
  priceText: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
  },
  restoreButton: {
    paddingVertical: 12,
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#ea580c',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  // Pro user styles
  header: {
    alignItems: 'center',
    paddingVertical: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter-Regular',
  },
  proStatusContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  proStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  thankYouContainer: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});