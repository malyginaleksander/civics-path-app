import React from 'react';
import { Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialExpiredProps {
  onUpgrade: () => void;
}

const TrialExpired: React.FC<TrialExpiredProps> = ({ onUpgrade }) => {
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
              Full access to all 100 USCIS questions
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
          onClick={onUpgrade}
          className="w-full h-12 text-lg font-semibold"
        >
          Upgrade to Premium
        </Button>
        
        <p className="text-xs text-muted-foreground">
          One-time purchase • No subscription
        </p>
      </div>
    </div>
  );
};

export default TrialExpired;
