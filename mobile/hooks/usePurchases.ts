import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesError,
  PURCHASES_ERROR_CODE,
  PurchasesOfferings,
} from 'react-native-purchases';

/**
 * RevenueCat configuration constants.
 * These match the project's setup in the RevenueCat dashboard.
 */
const ENTITLEMENT_ID = 'ConjugateIgbo Pro';
const PRODUCT_ID = 'conjugate_igbo_pro'; // Lifetime/Pro product ID

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Hook to manage RevenueCat purchases and customer status.
 *
 * @returns {Object} An object containing purchase state and methods.
 * @returns {boolean} returns.isProUser - Whether the user has an active Pro entitlement.
 * @returns {boolean} returns.isLoading - Whether the purchase data is currently loading.
 * @returns {PurchasesPackage[]} returns.packages - Available packages for purchase.
 * @returns {PurchasesOfferings | null} returns.offerings - Current RevenueCat offerings.
 * @returns {CustomerInfo | null} returns.customerInfo - Detailed customer information.
 * @returns {Function} returns.purchasePro - Function to purchase the Pro/Lifetime package.
 * @returns {Function} returns.purchasePackage - Function to purchase a specific package.
 * @returns {Function} returns.restorePurchases - Function to restore previous purchases.
 */
export const usePurchases = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  // Check if the user has the 'ConjugateIgbo Pro' entitlement active
  const isProUser = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];

  // Get available packages from the current offering
  const packages = useMemo(() => {
    return offerings?.current?.availablePackages ?? [];
  }, [offerings]);

  // Keep a ref to setCustomerInfo for the listener to avoid stale closure issues
  const setCustomerInfoRef = useRef(setCustomerInfo);
  setCustomerInfoRef.current = setCustomerInfo;

  useEffect(() => {
    if (!isNative) {
      setIsLoading(false);
      return;
    }

    let didCancel = false;

    /**
     * Loads initial customer info and offerings from RevenueCat.
     */
    async function load() {
      try {
        setIsLoading(true);
        const [info, offs] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);
        if (!didCancel) {
          setCustomerInfo(info);
          setOfferings(offs);
        }
      } catch {
        // console.warn('[usePurchases] RevenueCat initialization failed:', e);
      } finally {
        if (!didCancel) setIsLoading(false);
      }
    }

    load();

    // Listen for updates to customer info (e.g., after a purchase or restore)
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfoRef.current(info);
    });

    return () => {
      // Cleanup listener on unmount
      try {
        // @ts-ignore - RevenueCat v9 listener has remove()
        listener?.remove?.();
      } catch {}
      didCancel = true;
    };
  }, []);

  /**
   * Performs a purchase for a specific RevenueCat package.
   *
   * @param {any} pkg - The RevenueCat package to purchase.
   * @returns {Promise<boolean>} A promise that resolves to true if the purchase was successful and the entitlement is active.
   */
  const purchasePackage = useCallback(async (pkg: any) => {
    if (!isNative) return false;
    try {
      setIsLoading(true);
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(info);
      return !!info.entitlements?.active?.[ENTITLEMENT_ID];
    } catch (e) {
      const err = e as PurchasesError;
      if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return false; // User cancelled the purchase
      }
      // console.error('[usePurchases] Purchase failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Attempts to purchase the Pro/Lifetime package.
   * Searches for a package matching the product identifier or common keywords.
   *
   * @returns {Promise<boolean>} A promise that resolves to true if the purchase was successful and the entitlement is active.
   */
  const purchasePro = useCallback(async (): Promise<boolean> => {
    const proPackage = packages.find(
      (p) =>
        p.product.identifier === PRODUCT_ID ||
        p.packageType === 'LIFETIME' ||
        p.identifier === 'lifetime' ||
        p.identifier === 'pro'
    );

    if (!proPackage) {
      /* console.warn(
        '[usePurchases] No Pro package found. Available:',
        packages.map((p) => p.identifier)
      ); */
      return false;
    }

    return purchasePackage(proPackage);
  }, [packages, purchasePackage]);

  /**
   * Restores previous purchases for the user.
   *
   * @returns {Promise<boolean>} A promise that resolves to true if the restoration was successful and the entitlement is active.
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return !!info.entitlements?.active?.[ENTITLEMENT_ID];
    } catch {
      // console.error('[usePurchases] Restore failed:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isProUser,
    isLoading,
    packages,
    offerings,
    customerInfo,
    purchasePro,
    purchasePackage,
    restorePurchases,
  };
};
