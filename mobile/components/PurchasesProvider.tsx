import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import Purchases, {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesError,
  PURCHASES_ERROR_CODE,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { logger } from '@/lib/logger';
import {
  findLifetimeProPackage,
  hasActiveProEntitlement,
  isAlreadyPurchasedError,
} from '@/lib/purchaseProducts';
import { configureRevenueCat, isRevenueCatConfigured } from '@/lib/revenuecat';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

const ensureRevenueCatReady = (): boolean => {
  return isRevenueCatConfigured() || configureRevenueCat();
};

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
    return customerInfo ? hasActiveProEntitlement(customerInfo) : false;
  }, [customerInfo]);

  // Surface the anonymous RevenueCat user id + entitlement state to Sentry so
  // issues can be filtered by Pro vs Free and correlated across a session.
  // `originalAppUserId` is RevenueCat's anonymous install identifier — no PII.
  useEffect(() => {
    Sentry.setTag('isPro', String(isProUser));
    if (customerInfo?.originalAppUserId) {
      Sentry.setUser({ id: customerInfo.originalAppUserId });
    }
  }, [isProUser, customerInfo]);

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

    if (!ensureRevenueCatReady()) {
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
      logger.error(e, '[PurchasesProvider] RevenueCat initialization failed', {
        feature: 'purchases',
        component: 'PurchasesProvider',
      });
    } finally {
      // Always flip hasLoaded: failure to reach RevenueCat shouldn't trap
      // the pro screen on a spinner. Gated UI can still render (without
      // packages) and the user can retry via pull-to-refresh / restore.
      setHasLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer SDK init off the launch frame. RevenueCat reads
    // [NSBundle appStoreReceiptURL] during configure, which on iPadOS 26
    // does an XPC roundtrip into LaunchServices that has crashed during
    // launch (App Review rejection). Running after interactions guarantees
    // the first paint completes before we touch the SDK.
    const interaction = InteractionManager.runAfterInteractions(() => {
      load();
    });

    if (!isNative) {
      return () => interaction.cancel();
    }

    let listener: CustomerInfoUpdateListener | null = null;

    const registerListener = () => {
      if (!ensureRevenueCatReady()) return;
      listener = (info) => {
        setCustomerInfoRef.current(info);
      };
      try {
        Purchases.addCustomerInfoUpdateListener(listener);
      } catch (e) {
        logger.error(e, 'Registering RevenueCat customer info listener failed', {
          feature: 'purchases',
          component: 'PurchasesProvider',
          extra: { context: 'Registering customer info listener failed' },
        });
      }
    };

    const listenerInteraction = InteractionManager.runAfterInteractions(registerListener);

    return () => {
      interaction.cancel();
      listenerInteraction.cancel();
      if (listener) {
        try {
          Purchases.removeCustomerInfoUpdateListener(listener);
        } catch (err) {
          logger.warn('Removing RevenueCat customer info listener failed', {
            feature: 'purchases',
            component: 'PurchasesProvider',
            extra: { error: String(err) },
          });
        }
      }
    };
  }, [load]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    if (!isNative) return false;
    if (!ensureRevenueCatReady()) return false;
    return Sentry.startSpan(
      {
        name: 'purchasePackage',
        op: 'purchase',
        attributes: {
          'purchase.packageIdentifier': pkg.identifier,
          'purchase.productType': pkg.product.productType,
          'purchase.packageType': pkg.packageType,
        },
      },
      async () => {
        try {
          setIsLoading(true);
          const { customerInfo: info } = await Purchases.purchasePackage(pkg);
          setCustomerInfo(info);
          return hasActiveProEntitlement(info);
        } catch (e) {
          const err = e as PurchasesError;

          // If user already owns it but it didn't sync, try to restore.
          if (isAlreadyPurchasedError(err)) {
            try {
              const restoredInfo = await Purchases.restorePurchases();
              setCustomerInfo(restoredInfo);

              const hasPro = hasActiveProEntitlement(restoredInfo);

              if (!hasPro) {
                logger.warn('User already owned product but no matching active entitlement found after restore', {
                  feature: 'purchases',
                  component: 'PurchasesProvider',
                  extra: {
                    activeEntitlementCount: Object.keys(restoredInfo.entitlements?.active || {}).length,
                    errorCode: err?.code,
                  },
                });
              }

              return hasPro;
            } catch (restoreErr) {
              logger.error(restoreErr, 'Restore after PRODUCT_ALREADY_PURCHASED failed', {
                feature: 'purchases',
                component: 'PurchasesProvider',
                extra: { originalErrorCode: err?.code },
              });
              // fallthrough to regular error handling below
            }
          }

          if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            return false;
          }

          logger.error(err, 'Purchase failed', {
            feature: 'purchases',
            component: 'PurchasesProvider',
            extra: { context: 'Purchase failed', errorCode: err?.code },
          });
          return false;
        } finally {
          setIsLoading(false);
        }
      },
    );
  }, []);

  const purchasePro = useCallback(async (): Promise<boolean> => {
    const proPackage = findLifetimeProPackage(packages);

    if (!proPackage) {
      return false;
    }

    return purchasePackage(proPackage);
  }, [packages, purchasePackage]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;
    if (!ensureRevenueCatReady()) return false;
    return Sentry.startSpan(
      { name: 'restorePurchases', op: 'purchase' },
      async () => {
        try {
          setIsLoading(true);
          const info = await Purchases.restorePurchases();
          setCustomerInfo(info);
          return hasActiveProEntitlement(info);
        } catch (e: any) {
          logger.error(e, 'Restore purchases failed', {
            feature: 'purchases',
            component: 'PurchasesProvider',
            extra: { context: 'Restore failed' },
          });
          return false;
        } finally {
          setIsLoading(false);
        }
      },
    );
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
