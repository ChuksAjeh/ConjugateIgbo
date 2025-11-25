// Web-safe fallback for purchases. This avoids bundling native RevenueCat SDK on web.
// The native implementation remains in hooks/usePurchases.ts for iOS/Android.

export type PurchasesPackage = unknown;

export const usePurchases = () => {
  return {
    isProUser: false as boolean,
    isLoading: false as boolean,
    packages: [] as PurchasesPackage[],
    offerings: null as any,
    customerInfo: null as any,
    purchasePro: async () => false as boolean,
    purchasePackage: async () => false as boolean,
    restorePurchases: async () => false as boolean,
  };
};
