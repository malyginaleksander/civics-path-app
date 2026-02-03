import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '@/contexts/AppContext';

// Your RevenueCat entitlement identifier (set this in RevenueCat dashboard)
const ENTITLEMENT_ID = 'premium';

export const useRevenueCat = () => {
  const { setPremium } = useApp();
  const [isInitialized, setIsInitialized] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCustomerInfo, setLastCustomerInfo] = useState<any>(null);

  // Initialize RevenueCat SDK
  const initialize = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('RevenueCat: Not on native platform, skipping initialization');
      return;
    }

    try {
      const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
      
      // Set debug logging (disable in production)
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

      // Configure with your API key (public keys are safe to include in client)
      const apiKey = Capacitor.getPlatform() === 'ios' 
        ? 'appl_FksyfKgXYMEtcMkdQArtSnaueVF'
        : 'goog_CYjgsvnBGrhXfffPaOozVBJNxKO';

      if (!apiKey) {
        console.warn('RevenueCat: API key not configured for this platform');
        return;
      }

      await Purchases.configure({ apiKey });
      setIsInitialized(true);

      // Check initial subscription status
      await checkSubscriptionStatus();
    } catch (err) {
      console.error('RevenueCat initialization error:', err);
      setError('Failed to initialize purchases');
    }
  }, []);

  // Check if user has active subscription
  const checkSubscriptionStatus = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.getCustomerInfo();
      setLastCustomerInfo(customerInfo);
      
      const activeEntitlements = customerInfo.entitlements?.active || {};
      // Only grant premium if the specific 'premium' entitlement is active
      const hasActiveEntitlement = ENTITLEMENT_ID in activeEntitlements;
      console.log('RevenueCat checkSubscriptionStatus:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(activeEntitlements),
        hasActiveEntitlement,
        requiredEntitlement: ENTITLEMENT_ID
      });
      setPremium(hasActiveEntitlement);

      return hasActiveEntitlement;
    } catch (err) {
      console.error('Error checking subscription:', err);
      return false;
    }
  }, [setPremium]);

  // Get available packages/products
  const getOfferings = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return null;

    setIsLoading(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const result = await Purchases.getOfferings();
      
      console.log('RevenueCat offerings result:', JSON.stringify(result, null, 2));
      
      if (!result?.current) {
        console.warn('RevenueCat: No current offering. Check RevenueCat dashboard: 1) Products added 2) Entitlements configured 3) Offerings created with packages');
        setError('No products available. Please try again later.');
      } else if (!result.current.availablePackages?.length) {
        console.warn('RevenueCat: Offering exists but no packages. Add packages to your offering in RevenueCat dashboard.');
        setError('No products available. Please try again later.');
      }
      
      setOfferings(result);
      return result;
    } catch (err) {
      console.error('Error getting offerings:', err);
      setError('Failed to load products. Check internet connection.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase a package
  const purchasePackage = useCallback(async (packageToPurchase: any) => {
    if (!Capacitor.isNativePlatform()) {
      setError('Purchases only available on mobile devices');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');

      console.log('RevenueCat purchasePackage: starting purchase flow', {
        productId: packageToPurchase?.product?.identifier,
      });

      const { customerInfo } = await Purchases.purchasePackage({ 
        aPackage: packageToPurchase 
      });
      setLastCustomerInfo(customerInfo);

      const activeEntitlements = customerInfo.entitlements?.active || {};
      // Only grant premium if the specific 'premium' entitlement is active
      const hasActiveEntitlement = ENTITLEMENT_ID in activeEntitlements;
      console.log('RevenueCat purchasePackage result:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(activeEntitlements),
        hasActiveEntitlement,
        requiredEntitlement: ENTITLEMENT_ID
      });
      setPremium(hasActiveEntitlement);

      return hasActiveEntitlement;
    } catch (err: any) {
      if (err.code === 'PURCHASE_CANCELLED') {
        return false;
      }
      console.error('Purchase error:', err);
      setError('Purchase failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setPremium]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setError('Restore only available on mobile devices');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.restorePurchases();
      setLastCustomerInfo(customerInfo);

      const activeEntitlements = customerInfo.entitlements?.active || {};
      // Only grant premium if the specific 'premium' entitlement is active
      const hasActiveEntitlement = ENTITLEMENT_ID in activeEntitlements;
      console.log('RevenueCat restorePurchases result:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(activeEntitlements),
        hasActiveEntitlement,
        requiredEntitlement: ENTITLEMENT_ID
      });
      setPremium(hasActiveEntitlement);

      return hasActiveEntitlement;
    } catch (err) {
      console.error('Restore error:', err);
      setError('Failed to restore purchases');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setPremium]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Debug / investigation helpers (safe to ship; only used when explicitly exposed in UI)
  const getCustomerInfoDebug = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return null;
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.getCustomerInfo();
      setLastCustomerInfo(customerInfo);
      return customerInfo;
    } catch (e) {
      console.error('RevenueCat getCustomerInfoDebug error:', e);
      return null;
    }
  }, []);

  const resetRevenueCatUser = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      
      // First, get current user info for debugging
      const { customerInfo: currentInfo } = await Purchases.getCustomerInfo();
      console.warn('RevenueCat resetRevenueCatUser: current user before reset:', {
        originalAppUserId: currentInfo.originalAppUserId,
        activeEntitlements: Object.keys(currentInfo.entitlements?.active || {}),
      });
      
      // Generate a completely new random user ID and log into it.
      // This forces RevenueCat to create a brand new user with no entitlements.
      // logOut() doesn't work for anonymous users and configure() reuses the keychain ID.
      const randomId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      console.warn('RevenueCat resetRevenueCatUser: logging into fresh user:', randomId);
      
      const { customerInfo: newInfo } = await Purchases.logIn({ appUserID: randomId });
      
      console.warn('RevenueCat resetRevenueCatUser: new user after logIn:', {
        originalAppUserId: newInfo.originalAppUserId,
        activeEntitlements: Object.keys(newInfo.entitlements?.active || {}),
      });
      
      setLastCustomerInfo(newInfo);
      const hasActive = ENTITLEMENT_ID in (newInfo.entitlements?.active || {});
      setPremium(hasActive);
      
      return true;
    } catch (e: any) {
      // Log detailed error info
      console.error('RevenueCat resetRevenueCatUser error:', {
        message: e?.message,
        code: e?.code,
        underlyingErrorMessage: e?.underlyingErrorMessage,
        fullError: JSON.stringify(e),
      });
      return { error: e?.message || 'Unknown error' };
    }
  }, [setPremium]);

  return {
    isInitialized,
    isLoading,
    error,
    offerings,
    getOfferings,
    purchasePackage,
    restorePurchases,
    checkSubscriptionStatus,
    // debug
    lastCustomerInfo,
    getCustomerInfoDebug,
    resetRevenueCatUser,
  };
};
