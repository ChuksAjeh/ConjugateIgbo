import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import RevenueCatUI from 'react-native-purchases-ui';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export async function showPaywall(options?: any) {
  if (!isNative) {
    throw new Error('RevenueCatUI is not available on web.');
  }

  try {
    return await RevenueCatUI.presentPaywall(options ?? {});
  } catch (e: any) {
    Sentry.captureException(e, {
      tags: { feature: 'revenuecat-ui' },
      extra: { context: 'Failed to present paywall' },
    });
    throw e;
  }
}

export async function showCustomerCenter(options?: any) {
  if (!isNative) {
    throw new Error('RevenueCatUI is not available on web.');
  }

  try {
    return await RevenueCatUI.presentCustomerCenter(options ?? {});
  } catch (e: any) {
    Sentry.captureException(e, {
      tags: { feature: 'revenuecat-ui' },
      extra: { context: 'Failed to present customer center' },
    });
    throw e;
  }
}