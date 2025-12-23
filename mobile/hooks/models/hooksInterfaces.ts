
export interface ProgressStatistics {
  dailyGoalProgress: number;
  lastVisitDate: string;
}

// RevenueCat types (these would come from react-native-purchases in a real implementation)
export interface PurchaserInfo {
  entitlements: {
    active: {
      [key: string]: {
        identifier: string;
        isActive: boolean;
        productIdentifier: string;
      };
    };
  };
}

export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}
