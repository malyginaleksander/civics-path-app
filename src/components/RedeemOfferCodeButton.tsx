import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface RedeemOfferCodeButtonProps {
  disabled?: boolean;
  className?: string;
  onRedeemed?: () => void;
}

export const RedeemOfferCodeButton = ({ disabled, className, onRedeemed }: RedeemOfferCodeButtonProps) => {
  // Only show on iOS
  if (Capacitor.getPlatform() !== 'ios') {
    return null;
  }

  const handleRedeem = async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.presentCodeRedemptionSheet();
      // Callback to let parent know redemption sheet was shown
      onRedeemed?.();
    } catch (e: any) {
      if (e?.code !== 'PURCHASE_CANCELLED') {
        toast.error(e?.message || 'Failed to open offer code sheet');
      }
    }
  };

  return (
    <button
      onClick={handleRedeem}
      disabled={disabled}
      className={className || "text-sm text-primary hover:underline disabled:opacity-50"}
    >
      Redeem Offer Code
    </button>
  );
};