/**
 * @fileoverview Thin wrapper around RevenueCat's native UI helpers.
 *
 * The in-app paywall is rendered by our own `<ProScreen>` (see
 * `app/(tabs)/pro.tsx`) backed by `usePurchases()` — we do NOT use
 * RevenueCat's hosted `presentPaywall`. Only the Customer Center helper
 * is kept here for managing active subscriptions / receipts.
 */

import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import RevenueCatUI from 'react-native-purchases-ui';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Opens RevenueCat's Customer Center modal for viewing and managing the
 * user's active subscription, restoring purchases, or contacting support.
 * iOS / Android only — throws on web.
 */
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
