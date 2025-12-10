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
        ? '' // Add iOS key when ready
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
      
      const hasActiveEntitlement = ENTITLEMENT_ID in (customerInfo.entitlements?.active || {});
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
      setOfferings(result);
      return result;
    } catch (err) {
      console.error('Error getting offerings:', err);
      setError('Failed to load products');
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
      const { customerInfo } = await Purchases.purchasePackage({ 
        aPackage: packageToPurchase 
      });

      const hasActiveEntitlement = ENTITLEMENT_ID in (customerInfo.entitlements?.active || {});
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

      const hasActiveEntitlement = ENTITLEMENT_ID in (customerInfo.entitlements?.active || {});
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

  return {
    isInitialized,
    isLoading,
    error,
    offerings,
    getOfferings,
    purchasePackage,
    restorePurchases,
    checkSubscriptionStatus,
  };
};
