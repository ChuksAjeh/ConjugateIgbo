// Web-safe fallback for purchases. This avoids bundling native RevenueCat SDK on web.
// The native implementation remains in hooks/usePurchases.ts for iOS/Android.

export type PurchasesPackage = unknown;

export const usePurchases = () => {
  return {
    isProUser: false as boolean,
    isLoading: false as boolean,
    // Match the native provider contract so the web Pro screen does not hang on
    // its loading branch (`if (!hasLoaded) return <spinner>`).
    hasLoaded: true as boolean,
    packages: [] as PurchasesPackage[],
    offerings: null as any,
    customerInfo: null as any,
    purchasePro: async () => false as boolean,
    purchasePackage: async () => false as boolean,
    restorePurchases: async () => false as boolean,
  };
};
