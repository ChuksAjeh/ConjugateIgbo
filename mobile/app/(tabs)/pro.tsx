import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { createStyles } from './proStyles';
import { presentPaywall } from '@/lib/revenuecatUI';

export default function ProScreen() {
  const { theme, isDark } = useTheme();
  const { isProUser, isLoading, purchasePro, restorePurchases, offerings } = usePurchases();
  const styles = createStyles(theme, isDark);
  const router = useRouter();

  // No decorative UI needed for the blank fallback design.

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

  // Auto-present the paywall when this tab/screen gains focus
  const hasPresentedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      // Reset the gate on focus so revisiting the tab can show the paywall again
      hasPresentedRef.current = false;
      // Present shortly after focus to allow transitions to finish
      const t = setTimeout(() => {
        if (!hasPresentedRef.current) {
          hasPresentedRef.current = true;
          handlePurchase();
        }
      }, 250);
      return () => clearTimeout(t);
    }, [offerings?.current?.identifier])
  );

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

  // If the user is already Pro: do not render this screen/tab. Redirect away.
  useEffect(() => {
    if (isProUser) {
      // Replace with the Practice tab (index) so Pro users never see this screen
      try {
        router.replace('/(tabs)/index');
      } catch {}
    }
  }, [isProUser]);
  if (isProUser) return null;

  // Precompute a light-weight grid of lion icons for the fun fallback background
  const lionGrid = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    const cell = 72; // size of each grid cell
    const cols = Math.max(4, Math.ceil(width / cell));
    const rows = Math.max(8, Math.ceil(height / cell));
    const total = cols * rows;
    const items: React.ReactNode[] = [];
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      items.push(
        <Image
          key={`lion-${i}`}
          source={require('@/assets/images/lion.png')}
          style={{
            width: 28,
            height: 28,
            opacity: 0.08,
            margin: 8,
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      );
    }
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 24,
          paddingHorizontal: 16,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {items}
      </View>
    );
  }, []);

  // Fallback UI: playful screen with coral→deep red gradient, lion grid, and call-to-action
  return (
    <SafeAreaView style={[styles.container, { padding: 16 }]}> 
      <LinearGradient
        colors={["#ff7f50", "#dc2626", "#991b1b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Lion grid pattern background */}
      {lionGrid}

      {/* Foreground content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          accessibilityRole="header"
          style={{
            color: 'white',
            fontSize: 22,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Oops, you weren’t supposed to see this!
        </Text>
        <Text
          style={{
            color: 'white',
            opacity: 0.9,
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            marginBottom: 20,
            paddingHorizontal: 12,
          }}
        >
          Please click the button below to access the paywall.
        </Text>

        <TouchableOpacity
          onPress={handlePurchase}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Open Paywall"
          style={{
            paddingVertical: 14,
            paddingHorizontal: 22,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.35)',
            minWidth: 180,
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Open Paywall</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}