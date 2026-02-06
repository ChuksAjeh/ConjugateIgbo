import React, { useCallback, useMemo } from 'react';
import * as Sentry from '@sentry/react-native';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { createStyles } from '@/styles/proStyles';
import { showPaywall } from '@/lib/revenuecatUI';

export default function ProScreen() {
  const { theme, isDark } = useTheme();
  const { isProUser, isLoading, purchasePro, offerings } =
    usePurchases();
  const styles = createStyles(theme, isDark);
  const router = useRouter();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (isProUser) return;

        e.preventDefault();
        router.replace('/(tabs)');
      });

      return unsubscribe;
    }, [navigation, router, isProUser])
  );

  /**
   * Displays an alert with the given title and message.
   *
   * @param {string} title - The title of the alert.
   * @param {string} message - The message of the alert.
   * @param {string} [buttonText='OK'] - The text for the alert button.
   * @returns {void}
   */
  const showAlert = (title: string, message: string, buttonText = 'OK') => {
    Alert.alert(title, message, [{ text: buttonText, style: 'default' }]);
  };

  /**
   * Handles the purchase flow by first attempting to show the RevenueCat paywall UI.
   * If the paywall UI is unavailable (e.g., in Expo Go or non-native), it falls back
   * to a direct purchase attempt using the purchasePro function.
   *
   * @returns {Promise<void>}
   */
  const handlePurchase = useCallback(async () => {
    if (isProUser) return;

    try {
      const offeringIdentifier = offerings?.current?.identifier;

      await showPaywall({
        displayCloseButton: true,
        offeringIdentifier,
      });

      return;
    } catch (error) {
      const err = error as any;
      const code = err?.code;
      const message = err?.message;
      const userCancelled =
        err?.userCancelled || code === 'PURCHASE_CANCELLED' || code === '1';

      // User cancelled - don't show an error
      if (userCancelled) {
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
        try {
          await purchasePro();
          return;
        } catch(e: any) {
          Sentry.captureException(e, {
            tags: { feature: 'pro', screen: 'ProScreen' },
            extra: { context: 'Direct purchase fallback' },
          });
          Alert.alert('Purchase Error', 'Unable to start purchase.');
          return;
        }
      }
      // For other unexpected errors, show a generic error
      Sentry.captureException(err, {
        tags: { feature: 'pro', screen: 'ProScreen' },
        extra: { context: 'Unexpected paywall error' },
      });
      showAlert(
        'Purchase Error',
        `Unable to present paywall: ${message || 'Unknown error'}`,
      );
    }
  }, [isProUser, offerings, purchasePro]);

  // If the user is already Pro, redirect them out of here
  // We use useFocusEffect to handle this as soon as they land here, 
  // or if they become Pro while on this screen.
  useFocusEffect(
    useCallback(() => {
      if (!isLoading && isProUser) {
        router.replace('/(tabs)');
      }
    }, [isProUser, isLoading, router])
  );

  // Auto-present the paywall when this tab/screen gains focus if user is not Pro
  useFocusEffect(
    useCallback(() => {
      if (isProUser || isLoading) return;

      handlePurchase();
    }, [handlePurchase, isProUser, isLoading]),
  );

  // Precompute a light-weight grid of lion icons for the fun fallback background
  const lionGrid = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    const cell = 72; // size of each grid cell
    const cols = Math.max(4, Math.ceil(width / cell));
    const rows = Math.max(8, Math.ceil(height / cell));
    const total = cols * rows;
    const items: React.ReactNode[] = [];
    for (let i = 0; i < total; i++) {
      items.push(
        <Image
          key={`lion-${i}`}
          source={require('@/assets/images/logo.png')}
          style={{
            width: 28,
            height: 28,
            opacity: 0.08,
            margin: 8,
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />,
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

  // If the user is already Pro, show a success message or handle redirection
  if (!isLoading && isProUser) {
    return (
      <SafeAreaView style={[styles.container, { padding: 16 }]}>
        <LinearGradient
          colors={['#10b981', '#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {lionGrid}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            accessibilityRole="header"
            style={{
              color: 'white',
              fontSize: 28,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            You are a Pro!
          </Text>
          <Text
            style={{
              color: 'white',
              opacity: 0.9,
              fontSize: 16,
              lineHeight: 24,
              textAlign: 'center',
              marginBottom: 20,
              paddingHorizontal: 24,
            }}
          >
            Thank you for supporting ConjugateIgbo. You have full access to all
            features.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 12,
              backgroundColor: 'white',
              minWidth: 200,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#047857', fontSize: 16, fontWeight: '700' }}>
              Start Practicing
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // While checking status, show a loader to prevent flicker
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Fallback UI: playful screen with coral→deep red gradient, lion grid, and call-to-action
  return (
    <SafeAreaView style={[styles.container, { padding: 16 }]}>
      <LinearGradient
        colors={['#ff7f50', '#dc2626', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Lion grid pattern background */}
      {lionGrid}

      {/* Foreground content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="white" style={{ marginBottom: 20 }} />
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
          Loading Pro Experience...
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
          The paywall should appear momentarily. If it doesn&#39;t, please click the button below.
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
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
              Open Paywall
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
