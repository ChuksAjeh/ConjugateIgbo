import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

// Use your test key in development. For prod builds, prefer platform-specific keys via the Expo config plugin.
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_API_URL;


if (!REVENUECAT_API_KEY) {
  console.error("RevenueCat API key missing");
}

// Keep a stable reference to the listener callback so we can remove it if supported
let customerInfoListenerCb: ((info: CustomerInfo) => void) | null = null;

export function configureRevenueCat(
  onCustomerInfo?: (info: CustomerInfo) => void,
) {
  // Skip configuration on web
  if (!(Platform.OS === 'ios' || Platform.OS === 'android')) {
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

  Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
    // If you use your own auth, set appUserID here
    // appUserID: undefined,
    dangerousSettings: {
      autoSyncPurchases: true,
    },
  });

  if (
    customerInfoListenerCb &&
    (Purchases as any).removeCustomerInfoUpdateListener
  ) {
    try {
      (Purchases as any).removeCustomerInfoUpdateListener(
        customerInfoListenerCb,
      );
    } catch {}
  }
  customerInfoListenerCb = (info: CustomerInfo) => {
    onCustomerInfo?.(info);
  };
  Purchases.addCustomerInfoUpdateListener(customerInfoListenerCb);
}

export function cleanupRevenueCat() {
  if (
    customerInfoListenerCb &&
    (Purchases as any).removeCustomerInfoUpdateListener
  ) {
    try {
      (Purchases as any).removeCustomerInfoUpdateListener(
        customerInfoListenerCb,
      );
    } catch {}
  }
  customerInfoListenerCb = null;
}
