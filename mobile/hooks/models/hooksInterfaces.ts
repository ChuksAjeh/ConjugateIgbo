export interface VerbProgress {
  verbId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticed: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}


export interface ProgressStatistics {
  totalPracticed: number;
  currentStreak: number;
  totalStudyTime: number; // in hours
  tenseProgress: {
    present: number;
    past: number;
    future: number;
    subjunctive: number;
  };
  weeklyProgress: {
    day: string;
    practiced: number;
  }[];
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