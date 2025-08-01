import { useState, useEffect } from 'react';

// RevenueCat types (these would come from react-native-purchases in a real implementation)
interface PurchaserInfo {
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

interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

// Mock RevenueCat for web/development
const MockPurchases = {
  configure: async (apiKey: string) => {
    console.log('RevenueCat configured with key:', apiKey);
  },
  
  getOfferings: async () => {
    return {
      current: {
        availablePackages: [
          {
            identifier: 'pro_lifetime',
            packageType: 'LIFETIME',
            product: {
              identifier: 'pro_lifetime',
              price: 5.0,
              priceString: '£5.00',
              currencyCode: 'GBP',
            },
          },
        ],
      },
    };
  },
  
  purchasePackage: async (packageToPurchase: PurchasesPackage) => {
    // Simulate purchase success
    return {
      purchaserInfo: {
        entitlements: {
          active: {
            pro: {
              identifier: 'pro',
              isActive: true,
              productIdentifier: 'pro_lifetime',
            },
          },
        },
      },
    };
  },
  
  getPurchaserInfo: async (): Promise<PurchaserInfo> => {
    // Check if user has purchased (stored in localStorage for web)
    const hasPurchased = localStorage.getItem('igbo_pro_purchased') === 'true';
    
    return {
      entitlements: {
        active: hasPurchased ? {
          pro: {
            identifier: 'pro',
            isActive: true,
            productIdentifier: 'pro_lifetime',
          },
        } : {},
      },
    };
  },
  
  restoreTransactions: async () => {
    // In a real app, this would restore from the app store
    const hasPurchased = localStorage.getItem('igbo_pro_purchased') === 'true';
    
    return {
      purchaserInfo: {
        entitlements: {
          active: hasPurchased ? {
            pro: {
              identifier: 'pro',
              isActive: true,
              productIdentifier: 'pro_lifetime',
            },
          } : {},
        },
      },
    };
  },
};

export const usePurchases = () => {
  const [isProUser, setIsProUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      // In a real app, you'd use your RevenueCat API key
      await MockPurchases.configure('your_revenuecat_api_key');
      
      // Check current purchaser info
      const purchaserInfo = await MockPurchases.getPurchaserInfo();
      setIsProUser(purchaserInfo.entitlements.active.pro?.isActive || false);
      
      // Get available packages
      const offerings = await MockPurchases.getOfferings();
      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      console.error('Error initializing purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePro = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const proPackage = packages.find(pkg => pkg.identifier === 'pro_lifetime');
      if (!proPackage) {
        throw new Error('Pro package not found');
      }

      const { purchaserInfo } = await MockPurchases.purchasePackage(proPackage);
      const isPro = purchaserInfo.entitlements.active.pro?.isActive || false;
      
      setIsProUser(isPro);
      
      // Store purchase status for web (in a real app, RevenueCat handles this)
      if (isPro) {
        localStorage.setItem('igbo_pro_purchased', 'true');
      }
      
      return isPro;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { purchaserInfo } = await MockPurchases.restoreTransactions();
      const isPro = purchaserInfo.entitlements.active.pro?.isActive || false;
      
      setIsProUser(isPro);
      
      return isPro;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isProUser,
    isLoading,
    packages,
    purchasePro,
    restorePurchases,
  };
};