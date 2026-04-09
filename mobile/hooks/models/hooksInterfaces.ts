/**
 * @fileoverview Shared TypeScript interfaces for custom hook return values.
 *
 * Placing hook-specific types here keeps them out of the domain models
 * (`@/models/`) which are reserved for data-layer shapes, and avoids
 * coupling hooks to each other via circular imports.
 */

/**
 * Persisted daily-progress statistics.
 * Reset to zero each calendar day by `useProgress`.
 */
export interface ProgressStatistics {
  /** Number of verb cards completed today. */
  dailyGoalProgress: number;
  /**
   * ISO-like date string produced by `new Date().toDateString()`.
   * Used to detect when a new calendar day has started.
   */
  lastVisitDate: string;
}

/**
 * Simplified subset of the RevenueCat `CustomerInfo` shape.
 * Used by `usePurchases` to check active entitlements without importing
 * the full `react-native-purchases` types everywhere.
 */
export interface PurchaserInfo {
  entitlements: {
    active: {
      [entitlementId: string]: {
        /** The entitlement identifier (e.g. `'pro'`). */
        identifier: string;
        /** Whether this entitlement is currently active. */
        isActive: boolean;
        /** The product SKU associated with this entitlement. */
        productIdentifier: string;
      };
    };
  };
}

/**
 * Simplified representation of a RevenueCat `Package`.
 * Contains the information needed to display pricing and trigger a purchase.
 */
export interface PurchasesPackage {
  /** RevenueCat package identifier (e.g. `'$rc_monthly'`). */
  identifier: string;
  /** Package type string (e.g. `'MONTHLY'`, `'ANNUAL'`). */
  packageType: string;
  /** The underlying product details. */
  product: {
    /** Store product SKU. */
    identifier: string;
    /** Numeric price in the user's currency. */
    price: number;
    /** Localised price string (e.g. `'£3.99'`). */
    priceString: string;
    /** ISO 4217 currency code (e.g. `'GBP'`). */
    currencyCode: string;
  };
}
