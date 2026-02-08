import { usePurchases as usePurchasesFromProvider } from '@/components/PurchasesProvider';

/**
 * Hook to manage RevenueCat purchases and customer status.
 * Re-exports from PurchasesProvider to ensure consistent global state.
 */
export const usePurchases = () => {
  return usePurchasesFromProvider();
};
