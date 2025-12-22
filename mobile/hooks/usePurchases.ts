import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesError,
  PURCHASES_ERROR_CODE,
  PurchasesOfferings,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'entldefbca344e';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Some versions of @types for react-native-purchases do not export `Package`.
// Use a relaxed type here to avoid type errors while keeping runtime correct.
export type PurchasesPackage = any;

export const usePurchases = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  const isProUser = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
  const packages: PurchasesPackage[] = useMemo(() => {
    return offerings?.current?.availablePackages ?? [];
  }, [offerings]);

  const setCustomerInfoRef = useRef(setCustomerInfo);
  setCustomerInfoRef.current = setCustomerInfo;

  useEffect(() => {
    if (!isNative) {
      setIsLoading(false);
      return;
    }

    let didCancel = false;

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
      } catch (e) {
        console.warn('RevenueCat init failed', e);
      } finally {
        if (!didCancel) setIsLoading(false);
      }
    }

    load();

    const listener: any = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfoRef.current(info);
    });

    return () => {
      // RevenueCat v9 returns a listener object with a remove() method
      try {
        listener?.remove?.();
      } catch {}
      didCancel = true;
    };
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    if (!isNative) return false;
    try {
      setIsLoading(true);
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(info);
      return !!info.entitlements?.active?.[ENTITLEMENT_ID];
    } catch (e) {
      const err = e as PurchasesError;
      if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return false; // user cancelled
      }
      console.error('Purchase failed', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchasePro = useCallback(async (): Promise<boolean> => {
    const lifetime = packages.find((p) => p.identifier === 'lifetime');
    if (!lifetime) return false;
    return purchasePackage(lifetime);
  }, [packages, purchasePackage]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return !!info.entitlements?.active?.[ENTITLEMENT_ID];
    } catch (e) {
      console.error('Restore failed', e);
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
