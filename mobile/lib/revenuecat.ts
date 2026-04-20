import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

let configured = false;

/**
 * Initializes RevenueCat SDK.
 * Should be called once at the app root to set up the singleton instance.
 *
 * @returns {void}
 */
export function configureRevenueCat() {
  // Skip configuration on non-native platforms (web)
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return;
  }

  // Guard against double-configure (Fast Refresh / StrictMode re-runs the
  // mounting effect). RevenueCat logs a warning on re-configure.
  if (configured) {
    return;
  }

  if (!REVENUECAT_API_KEY) {
    Sentry.captureMessage(
      '[RevenueCat] API key missing. Check your environment variables.',
      {
        level: 'error',
        tags: { feature: 'revenuecat' },
      },
    );
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

  Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
  });

  configured = true;
}
