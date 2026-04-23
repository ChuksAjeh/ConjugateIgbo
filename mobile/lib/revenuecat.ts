import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { logger } from '@/lib/logger';

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_IOS_KEY;
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

let configured = false;

/**
 * Initializes RevenueCat SDK.
 * Should be called once at the app root to set up the singleton instance.
 *
 * @returns {void}
 */
export function configureRevenueCat(): boolean {
  // Skip configuration on non-native platforms (web)
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }

  // Guard against double-configure (Fast Refresh / StrictMode re-runs the
  // mounting effect). RevenueCat logs a warning on re-configure.
  if (configured) {
    return true;
  }

  const apiKey = __DEV__
    ? REVENUECAT_API_KEY_ANDROID
    : Platform.OS === 'ios'
      ? REVENUECAT_API_KEY_IOS
      : REVENUECAT_API_KEY_ANDROID;

  if (!apiKey) {
    logger.error(
      new Error(`[RevenueCat] API key missing for ${Platform.OS}`),
      `[RevenueCat] API key missing for ${Platform.OS}. Check your environment variables.`,
      {
        feature: 'revenuecat',
        component: 'configureRevenueCat',
        tags: { os: Platform.OS },
      },
    );
    return false;
  }

  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

    Purchases.configure({
      apiKey: apiKey,
    });

    configured = true;
    logger.info('[RevenueCat] SDK configured', {
      feature: 'revenuecat',
      component: 'configureRevenueCat',
      tags: { os: Platform.OS },
    });
    return true;
  } catch (error) {
    logger.error(error, 'Configuring RevenueCat failed', {
      feature: 'revenuecat',
      component: 'configureRevenueCat',
      tags: { os: Platform.OS },
      extra: { context: 'Configuring RevenueCat failed' },
    });
    return false;
  }
}

/**
 * Reports whether RevenueCat has successfully been configured.
 *
 * Native RevenueCat calls can abort the app when invoked before configuration,
 * so callers should gate any SDK interaction behind this value.
 */
export function isRevenueCatConfigured(): boolean {
  return configured;
}
