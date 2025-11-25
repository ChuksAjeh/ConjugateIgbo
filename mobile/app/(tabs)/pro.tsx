import React, { useMemo } from 'react';
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
import { presentPaywall } from '@/lib/revenuecatUI';

export default function ProScreen() {
  const { theme, isDark } = useTheme();
  const { isProUser, isLoading, purchasePro, restorePurchases, offerings } = usePurchases();
  const styles = createStyles(theme, isDark);

  // Pattern background (computed once)
  const patternBackground = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    const patterns = [] as React.ReactNode[];
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

  const showAlert = (title: string, message: string, buttonText = 'OK') => {
    Alert.alert(title, message, [{ text: buttonText, style: 'default' }]);
  };

  // Try RevenueCat Paywall first, then fall back to direct purchase if unavailable
  const handlePurchase = async () => {
    try {
      const offeringIdentifier = offerings?.current?.identifier;
      console.log('[ProScreen] Presenting paywall with offering:', offeringIdentifier || 'default');
      
      const result = await presentPaywall({ displayCloseButton: true, offeringIdentifier });
      console.log('[ProScreen] Paywall result:', result);
      
      // Paywall closed - check if purchase was made
      // The customer info listener should have already updated if purchase succeeded
      // Give it a moment to process
      setTimeout(() => {
        console.log('[ProScreen] Post-paywall isProUser:', isProUser);
      }, 500);
      
      return;
    } catch (error) {
      const err = error as any;
      const code = err?.code;
      const message = err?.message;
      const userCancelled = err?.userCancelled; // Some versions provide this

      console.log('[ProScreen] Paywall error:', { 
        code, 
        message, 
        userCancelled,
        fullError: JSON.stringify(err, null, 2) 
      });

      // User cancelled - don't show an error
      if (userCancelled || code === 'PURCHASE_CANCELLED') {
        console.log('[ProScreen] User cancelled paywall');
        return;
      }

      // If the UI is not available (e.g., Expo Go or missing native module), fall back to direct purchase
      if (
        code === 'RC_UI_UNAVAILABLE_NATIVE' ||
        code === 'RC_UI_UNAVAILABLE_WEB' ||
        code === 'RC_UI_PAYWALL_UNAVAILABLE' ||
        code === 'RC_UI_EXPORT_MISSING' ||
        !offerings?.current
      ) {
        console.log('[ProScreen] Falling back to direct purchase. Reason:', code || 'no offerings');
        try {
          const ok = await purchasePro();
          if (!ok) {
            console.log('[ProScreen] Direct purchase returned false');
            // Don't show alert - user may have cancelled
            // Alert.alert('Purchase Not Completed', 'The purchase did not complete.');
          } else {
            console.log('[ProScreen] Direct purchase succeeded');
          }
          return;
        } catch (e) {
          console.error('[ProScreen] Direct purchase error', e);
          Alert.alert('Purchase Error', 'Unable to start purchase.');
          return;
        }
      }

      // For other unexpected errors, show a generic error
      console.error('[ProScreen] Unexpected paywall error', err);
      showAlert('Purchase Error', `Unable to present paywall: ${message || 'Unknown error'}`);
    }
  };

  // (Direct-purchase-only implementation removed in favor of paywall-first with fallback)

  const handleRestorePurchases = async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        showAlert('Purchases Restored!', 'Your Pro features have been restored successfully.', 'Great!');
      } else {
        showAlert('No Purchases Found', "We couldn't find any previous purchases to restore.");
      }
    } catch (error) {
      showAlert('Restore Failed', 'Unable to restore purchases. Please try again later.');
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
            <Text style={styles.headerTitle}>You&apos;re Pro!</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Section with Cat and Pattern */}
        <LinearGradient
          colors={['#fb923c', '#f97316']}
          style={styles.topSection}
        >
          <View style={styles.patternContainer}>
            {patternBackground}
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