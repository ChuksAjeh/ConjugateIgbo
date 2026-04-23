import {
  PACKAGE_TYPE,
  PRODUCT_CATEGORY,
  PRODUCT_TYPE,
  PurchasesPackage,
} from 'react-native-purchases';
import { logger } from '@/lib/logger';

/**
 * RevenueCat/App Store product identifier for the lifetime Pro unlock.
 *
 * This must be configured in App Store Connect as a non-consumable in-app
 * purchase and attached to the RevenueCat entitlement below.
 */
export const LIFETIME_PRO_PRODUCT_ID = 'conjugate_igbo_pro';

/**
 * RevenueCat entitlement that grants lifetime Pro access.
 */
export const PRO_ENTITLEMENT_ID = 'ConjugateIgbo Pro';

/**
 * Older/test entitlement identifier accepted during migration.
 */
export const PRO_ENTITLEMENT_ID_ALT = 'pro';

const LIFETIME_PACKAGE_IDENTIFIERS = new Set(['$rc_lifetime', 'lifetime', 'pro']);

const SUBSCRIPTION_PRODUCT_TYPES = new Set<string>([
  PRODUCT_TYPE.AUTO_RENEWABLE_SUBSCRIPTION,
  PRODUCT_TYPE.NON_RENEWABLE_SUBSCRIPTION,
  PRODUCT_TYPE.PREPAID_SUBSCRIPTION,
]);

export function hasActiveProEntitlement(customerInfo: {
  entitlements?: { active?: Record<string, unknown> };
}): boolean {
  return (
    !!customerInfo.entitlements?.active?.[PRO_ENTITLEMENT_ID] ||
    !!customerInfo.entitlements?.active?.[PRO_ENTITLEMENT_ID_ALT]
  );
}

export function isLifetimeProPackage(pkg: PurchasesPackage): boolean {
  const { product } = pkg;
  const hasExpectedIdentifier = product.identifier === LIFETIME_PRO_PRODUCT_ID;
  const hasLifetimePackage =
    pkg.packageType === PACKAGE_TYPE.LIFETIME ||
    LIFETIME_PACKAGE_IDENTIFIERS.has(pkg.identifier);
  const isSubscription =
    product.productCategory === PRODUCT_CATEGORY.SUBSCRIPTION ||
    SUBSCRIPTION_PRODUCT_TYPES.has(product.productType) ||
    !!product.subscriptionPeriod;

  return (hasExpectedIdentifier || hasLifetimePackage) && !isSubscription;
}

/**
 * Selects the single lifetime package from RevenueCat offerings.
 *
 * If RevenueCat/App Store is misconfigured with a subscription or consumable,
 * this returns null and emits a high-signal log instead of letting the user buy
 * the wrong product type.
 */
export function findLifetimeProPackage(packages: PurchasesPackage[]): PurchasesPackage | null {
  const lifetimePackage = packages.find(isLifetimeProPackage) ?? null;

  if (lifetimePackage) {
    return lifetimePackage;
  }

  logger.error(
    new Error('Lifetime Pro package was not found or is configured as a subscription.'),
    'RevenueCat offering missing lifetime non-consumable Pro package',
    {
      feature: 'purchases',
      component: 'purchaseProducts',
      extra: {
        expectedProductId: LIFETIME_PRO_PRODUCT_ID,
        availablePackages: packages.map((pkg) => ({
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          productIdentifier: pkg.product.identifier,
          productCategory: pkg.product.productCategory,
          productType: pkg.product.productType,
          subscriptionPeriod: pkg.product.subscriptionPeriod,
        })),
      },
    },
  );

  return null;
}
