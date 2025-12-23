import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Safely imports and calls presentPaywall from react-native-purchases-ui.
 * Falls back to throwing an error if the module is not available (e.g., on web or in Expo Go).
 *
 * @param {Object} [options] - Optional configuration for the paywall.
 * @param {string} [options.offeringIdentifier] - Specific offering to display.
 * @param {boolean} [options.displayCloseButton] - Whether to show the close button.
 * @returns {Promise<any>} A promise that resolves when the paywall is dismissed or a purchase is made.
 * @throws {Error} Throws an error if RevenueCatUI is not available on the current platform or environment.
 */
export async function presentPaywall(options?: any) {
  if (!isNative) {
    throw new Error('RevenueCatUI is not available on web.');
  }

  try {
    const RevenueCatUI = (await import('react-native-purchases-ui')) as any;
    const rcPresentPaywall = RevenueCatUI.presentPaywall;

    if (typeof rcPresentPaywall !== 'function') {
      throw new Error('presentPaywall is not a function in react-native-purchases-ui');
    }

    return await rcPresentPaywall(options ?? {});
  } catch (_e: any) {
    console.error('[RevenueCatUI] Failed to present paywall:', _e.message);
    
    // Check if it's a module loading error
    if (_e?.code === 'MODULE_NOT_FOUND' || _e?.message?.includes('Cannot find module')) {
      const err: any = new Error(
        'RevenueCatUI module unavailable. Use a Development Client or prebuilt app.'
      );
      err.code = 'RC_UI_UNAVAILABLE_NATIVE';
      throw err;
    }
    throw _e;
  }
}

/**
 * Safely imports and calls presentCustomerCenter from react-native-purchases-ui.
 *
 * @param {Object} [options] - Optional configuration for the customer center.
 * @returns {Promise<any>} A promise that resolves when the customer center is dismissed.
 * @throws {Error} Throws an error if RevenueCatUI is not available on the current platform or environment.
 */
export async function presentCustomerCenter(options?: any) {
  if (!isNative) {
    throw new Error('RevenueCatUI is not available on web.');
  }

  try {
    const RevenueCatUI = (await import('react-native-purchases-ui')) as any;
    const rcPresentCustomerCenter = RevenueCatUI.presentCustomerCenter;

    if (typeof rcPresentCustomerCenter !== 'function') {
      throw new Error('presentCustomerCenter is not a function in react-native-purchases-ui');
    }

    return await rcPresentCustomerCenter(options ?? {});
  } catch (_e: any) {
    console.error('[RevenueCatUI] Failed to present customer center:', _e.message);
    const err: any = new Error(
      'RevenueCatUI module unavailable. Use a Development Client or prebuilt app.'
    );
    err.code = 'RC_UI_UNAVAILABLE_NATIVE';
    throw err;
  }
}
