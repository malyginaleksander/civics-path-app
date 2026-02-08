import React, { useEffect, useState } from 'react';
import { Lock, Star, RotateCcw, Loader2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// Fallback price if RevenueCat fails to load (should match store pricing)
const FALLBACK_PRICE = '$6.99';

const TrialExpired: React.FC = () => {
  const { 
    offerings, 
    getOfferings, 
    purchasePackage, 
    restorePurchases,
    presentOfferCodeRedeemSheet,
    isLoading, 
    error 
  } = useRevenueCat();
  const [currentPackage, setCurrentPackage] = useState<any>(null);

  useEffect(() => {
    const loadOfferings = async () => {
      const result = await getOfferings();
      if (result?.current?.availablePackages?.length > 0) {
        setCurrentPackage(result.current.availablePackages[0]);
      }
    };
    
    if (Capacitor.isNativePlatform()) {
      loadOfferings();
    }
  }, [getOfferings]);

  const handlePurchase = async () => {
    if (!isNative) {
      toast.message('Purchase is available in the mobile app.');
      return;
    }

    if (!currentPackage) {
      const platform = Capacitor.getPlatform();
      console.warn('[RevenueCat] No package selected at paywall purchase click', {
        platform,
        isNative: Capacitor.isNativePlatform(),
        availablePackagesCount: offerings?.current?.availablePackages?.length ?? 0,
      });

      const refreshed = await getOfferings();
      const refreshedPackage = refreshed?.current?.availablePackages?.[0] ?? null;
      if (refreshedPackage) {
        setCurrentPackage(refreshedPackage);
        await purchasePackage(refreshedPackage);
        return;
      }

      console.error('No package available - RevenueCat offerings/packages not found');
      if (platform === 'ios') {
        toast.error('Purchase not available. No products found for this build.');
        toast.message(error ? `RevenueCat: ${error}` : 'Check RevenueCat Offering + App Store Connect IAP status for this app version.');
      } else {
        toast.error('Purchase not available. Please try again later.');
      }
      return;
    }
    await purchasePackage(currentPackage);
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  const isNative = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === 'ios';
  const isAndroid = Capacitor.getPlatform() === 'android';
  const priceString = currentPackage?.product?.priceString || FALLBACK_PRICE;

  const handleRedeemCode = () => {
    if (isIOS) {
      presentOfferCodeRedeemSheet();
    } else if (isAndroid) {
      toast.info('To redeem a promo code, open the Google Play Store app → Menu → Payments & subscriptions → Redeem promo code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Your Free Trial Has Ended
          </h1>
          <p className="text-muted-foreground">
            We hope you enjoyed using Civics Path! Upgrade to premium to continue your citizenship test preparation journey.
          </p>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Premium includes:</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Full access to all 128 USCIS questions
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Unlimited practice tests
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Learning List & Weak Areas features
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Audio support for all questions
            </li>
          </ul>
        </div>


        <Button 
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full h-12 text-lg font-semibold"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {isNative ? `Upgrade for ${priceString}` : 'Upgrade to Premium'}
        </Button>

        {!isNative && (
          <p className="text-xs text-muted-foreground text-center">
            Purchases aren’t available in the web preview. Please use the iOS/Android app.
          </p>
        )}

        {isNative && (
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={handleRestore}
              disabled={isLoading}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Purchase
            </Button>
            <Button
              variant="ghost"
              onClick={handleRedeemCode}
              disabled={isLoading}
              className="w-full"
            >
              <Gift className="w-4 h-4 mr-2" />
              Redeem {isIOS ? 'Offer' : 'Promo'} Code
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          One-time purchase • No subscription
        </p>
      </div>
    </div>
  );
};

export default TrialExpired;
