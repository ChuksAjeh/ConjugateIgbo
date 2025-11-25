import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Lightweight wrappers that safely import the UI module only on native.
export async function presentPaywall(options?: any) {
  if (!isNative) {
    const err: any = new Error('RevenueCatUI is not available on web.');
    err.code = 'RC_UI_UNAVAILABLE_WEB';
    throw err;
  }
  try {
    console.log('[revenuecatUI] Attempting to import react-native-purchases-ui...');
    const ui = await import('react-native-purchases-ui');
    
    console.log('[revenuecatUI] Module imported. Available exports:', Object.keys(ui));
    
    // Try different possible export patterns
    const fn = ui.presentPaywall || 
               (ui as any).default?.presentPaywall || 
               (ui as any).RevenueCatUI?.presentPaywall ||
               (ui as any).default;
    
    console.log('[revenuecatUI] presentPaywall function found:', !!fn, typeof fn);
    
    if (!fn || typeof fn !== 'function') {
      const err: any = new Error('presentPaywall export not found in react-native-purchases-ui');
      err.code = 'RC_UI_EXPORT_MISSING';
      err.availableExports = Object.keys(ui);
      throw err;
    }
    
    console.log('[revenuecatUI] Calling presentPaywall with options:', options);
    const result = await fn(options ?? {});
    console.log('[revenuecatUI] presentPaywall completed with result:', result);
    
    return result;
  } catch (e: any) {
    console.error('[revenuecatUI] presentPaywall failed:', {
      message: e?.message,
      code: e?.code,
      availableExports: e?.availableExports,
    });
    
    // If it's a module loading error, throw with our custom code
    if (!e?.code || e.code === 'MODULE_NOT_FOUND' || e?.message?.includes('Cannot find module')) {
      const err: any = new Error(
        `RevenueCatUI module unavailable. Build and run a Development Client or prebuilt app (not Expo Go). Original: ${e?.message || e}`
      );
      err.code = 'RC_UI_UNAVAILABLE_NATIVE';
      throw err;
    }
    
    // Otherwise, rethrow the original error (it might be user cancellation or other RC error)
    throw e;
  }
}

export async function presentCustomerCenter(options?: any) {
  if (!isNative) {
    const err: any = new Error('RevenueCatUI is not available on web.');
    err.code = 'RC_UI_UNAVAILABLE_WEB';
    throw err;
  }
  try {
    const ui = await import('react-native-purchases-ui');
    
    const fn = ui.presentCustomerCenter || 
               (ui as any).default?.presentCustomerCenter || 
               (ui as any).RevenueCatUI?.presentCustomerCenter;
    
    if (!fn || typeof fn !== 'function') {
      const err: any = new Error('presentCustomerCenter export not found in react-native-purchases-ui');
      err.code = 'RC_UI_EXPORT_MISSING';
      throw err;
    }
    
    return fn(options ?? {});
  } catch (e: any) {
    const err: any = new Error(
      `RevenueCatUI module unavailable. Build and run a Development Client or prebuilt app (not Expo Go). Original: ${e?.message || e}`
    );
    err.code = 'RC_UI_UNAVAILABLE_NATIVE';
    throw err;
  }
}
