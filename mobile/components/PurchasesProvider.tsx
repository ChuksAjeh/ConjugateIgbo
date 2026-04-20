import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import Purchases, {
  CustomerInfo,
  PurchasesError,
  PURCHASES_ERROR_CODE,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'ConjugateIgbo Pro';
const ENTITLEMENT_ID_ALT = 'pro'; // Common alternative
const PRODUCT_ID = 'conjugate_igbo_pro';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

interface PurchasesContextType {
  isProUser: boolean;
  isLoading: boolean;
  hasLoaded: boolean;
  packages: PurchasesPackage[];
  offerings: PurchasesOfferings | null;
  customerInfo: CustomerInfo | null;
  purchasePro: () => Promise<boolean>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

export const usePurchases = () => {
  const context = useContext(PurchasesContext);
  if (context === undefined) {
    throw new Error('usePurchases must be used within a PurchasesProvider');
  }
  return context;
};

export const PurchasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  const isProUser = useMemo(() => {
    return (
      !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] ||
      !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID_ALT]
    );
  }, [customerInfo]);

  const packages = useMemo(() => {
    return offerings?.current?.availablePackages ?? [];
  }, [offerings]);

  const setCustomerInfoRef = useRef(setCustomerInfo);
  setCustomerInfoRef.current = setCustomerInfo;

  const load = useCallback(async () => {
    if (!isNative) {
      // Web: no RevenueCat, but the UI still needs to render out of its
      // loading skeleton. Mark as "loaded" so gated screens display.
      setHasLoaded(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [info, offs] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      setCustomerInfo(info);
      setOfferings(offs);
    } catch (e: any) {
      Sentry.logger.warn(
        `[PurchasesProvider] RevenueCat initialization failed: ${e?.message || e}`,
        {
          tags: { feature: 'purchases', component: 'PurchasesProvider' },
          extra: { error: e },
        }
      );
    } finally {
      // Always flip hasLoaded: failure to reach RevenueCat shouldn't trap
      // the pro screen on a spinner. Gated UI can still render (without
      // packages) and the user can retry via pull-to-refresh / restore.
      setHasLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    if (!isNative) return;

    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfoRef.current(info);
    });

    return () => {
      try {
        // @ts-ignore
        listener?.remove?.();
      } catch {}
    };
  }, [load]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    if (!isNative) return false;
    try {
      setIsLoading(true);
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(info);
      return (
        !!info.entitlements?.active?.[ENTITLEMENT_ID] ||
        !!info.entitlements?.active?.[ENTITLEMENT_ID_ALT]
      );
    } catch (e) {
      const err = e as PurchasesError;
      
      // If user already owns it but it didn't sync, try to restore
      // @ts-ignore - Some versions might use different naming
      if (err?.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR || 
          // @ts-ignore
          err?.code === PURCHASES_ERROR_CODE.ProductAlreadyPurchasedError ||
          err?.code === (2 as any) ||
          err?.message?.toLowerCase().includes('already active') ||
          err?.message?.toLowerCase().includes('already owned')) {
         try {
           const restoredInfo = await Purchases.restorePurchases();
           setCustomerInfo(restoredInfo);
           
           const hasPro = !!restoredInfo.entitlements?.active?.[ENTITLEMENT_ID] ||
                          !!restoredInfo.entitlements?.active?.[ENTITLEMENT_ID_ALT];
           
           if (!hasPro) {
             Sentry.captureMessage('User already owned product but no matching active entitlement found after restore', {
               level: 'warning',
               extra: { 
                 activeEntitlements: Object.keys(restoredInfo.entitlements?.active || {}),
                 errorCode: err?.code,
                 errorMessage: err?.message
               }
             });
           }
           
           return hasPro;
         } catch {
           // fallback to regular error handling
         }
      }

      if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return false;
      }
      
      Sentry.captureException(err, {
        tags: { feature: 'purchases', component: 'PurchasesProvider' },
        extra: { context: 'Purchase failed', errorCode: err?.code },
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchasePro = useCallback(async (): Promise<boolean> => {
    const proPackage = packages.find(
      (p) =>
        p.product.identifier === PRODUCT_ID ||
        p.packageType === 'LIFETIME' ||
        p.identifier === 'lifetime' ||
        p.identifier === 'pro'
    );

    if (!proPackage) {
      Sentry.logger.warn('No Pro package found', {
        tags: { feature: 'purchases', component: 'PurchasesProvider' },
        extra: { availablePackages: packages.map((p) => p.identifier) },
      });
      return false;
    }

    return purchasePackage(proPackage);
  }, [packages, purchasePackage]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return (
        !!info.entitlements?.active?.[ENTITLEMENT_ID] ||
        !!info.entitlements?.active?.[ENTITLEMENT_ID_ALT]
      );
    } catch (e: any) {
      Sentry.captureException(e, {
        tags: { feature: 'purchases', component: 'PurchasesProvider' },
        extra: { context: 'Restore failed' },
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    isProUser,
    isLoading,
    hasLoaded,
    packages,
    offerings,
    customerInfo,
    purchasePro,
    purchasePackage,
    restorePurchases,
  }), [isProUser, isLoading, hasLoaded, packages, offerings, customerInfo, purchasePro, purchasePackage, restorePurchases]);

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
};
