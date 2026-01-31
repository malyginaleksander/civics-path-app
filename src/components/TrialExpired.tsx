import React, { useEffect, useState } from 'react';
import { Lock, Star, RotateCcw, Loader2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useApp } from '@/contexts/AppContext';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const TrialExpired: React.FC = () => {
  const { 
    offerings, 
    getOfferings, 
    purchasePackage, 
    restorePurchases,
    isLoading, 
    error 
  } = useRevenueCat();
  const { activatePromoCode } = useApp();
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

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

  const handlePromoSubmit = () => {
    setPromoLoading(true);
    setPromoError(null);
    
    const result = activatePromoCode(promoCode);
    
    if (!result.success) {
      setPromoError(result.message);
    }
    // If successful, the app context will update isPremium and this component will unmount
    
    setPromoLoading(false);
  };

  const isNative = Capacitor.isNativePlatform();
  const priceString = currentPackage?.product?.priceString;
  const isLoadingPrice = isNative && !priceString;

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

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button 
          onClick={handlePurchase}
          disabled={isLoading || isLoadingPrice}
          className="w-full h-12 text-lg font-semibold"
        >
          {isLoading || isLoadingPrice ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {isLoadingPrice ? 'Loading...' : (priceString ? `Upgrade for ${priceString}` : 'Upgrade to Premium')}
        </Button>

        {!isNative && (
          <p className="text-xs text-muted-foreground text-center">
            Purchases aren’t available in the web preview. Please use the iOS/Android app.
          </p>
        )}

        {isNative && (
          <Button
            variant="ghost"
            onClick={handleRestore}
            disabled={isLoading}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore Purchase
          </Button>
        )}

        {/* Promo Code Section */}
        {!showPromoInput ? (
          <button
            onClick={() => setShowPromoInput(true)}
            className="text-sm text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Ticket className="w-4 h-4" />
            Have a promo code?
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoError(null);
                }}
                className="flex-1"
              />
              <Button
                onClick={handlePromoSubmit}
                disabled={promoLoading || !promoCode.trim()}
                size="default"
              >
                {promoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
            {promoError && (
              <p className="text-sm text-destructive">{promoError}</p>
            )}
            <button
              onClick={() => {
                setShowPromoInput(false);
                setPromoCode('');
                setPromoError(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
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
