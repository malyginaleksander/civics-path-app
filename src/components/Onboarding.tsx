import { useState } from 'react';
import { MapPin, Users, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { statesData } from '@/data/stateData';
import { useApp } from '@/contexts/AppContext';

type Step = 'state' | 'senior' | 'complete';

export const Onboarding = () => {
  const { updateSettings, settings } = useApp();
  const [step, setStep] = useState<Step>('state');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [seniorMode, setSeniorMode] = useState(false);

  const handleStateNext = () => {
    if (selectedState) {
      setStep('senior');
    }
  };

  const handleComplete = () => {
    updateSettings({ 
      selectedState, 
      seniorMode,
      onboardingCompleted: true 
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 overflow-hidden">
            <img 
              src="https://flagcdn.com/w80/us.png" 
              alt="USA Flag" 
              className="w-12 h-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Civics Path
          </h1>
          <p className="text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 'state' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 'senior' ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {/* Step 1: State Selection */}
        {step === 'state' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Select Your State</h2>
                  <p className="text-sm text-muted-foreground">For state-specific questions</p>
                </div>
              </div>

              <Select
                value={selectedState || ''}
                onValueChange={(value) => setSelectedState(value || null)}
              >
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Choose your state..." />
                </SelectTrigger>
                <SelectContent>
                  {statesData.map((state) => (
                    <SelectItem key={state.abbreviation} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground mt-3">
                Some questions ask about your state's Governor and Senators. You can change this later in Settings.
              </p>

              <Button 
                className="w-full mt-6 h-12 text-base"
                onClick={handleStateNext}
                disabled={!selectedState}
              >
                Continue
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Senior Mode */}
        {step === 'senior' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Are you 65 or older?</h2>
                  <p className="text-sm text-muted-foreground">With 20+ years as a permanent resident</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Enable Senior Mode</p>
                    <p className="text-sm text-muted-foreground">65/20 Rule</p>
                  </div>
                  <Switch
                    checked={seniorMode}
                    onCheckedChange={setSeniorMode}
                  />
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-3 mb-6">
                <p className="text-sm text-muted-foreground">
                  {seniorMode 
                    ? "✓ You'll study only 20 specially marked questions and take shorter tests (10 questions)."
                    : "You'll study all 128 official USCIS questions and take full practice tests (20 questions)."
                  }
                </p>
              </div>

              <Button 
                className="w-full h-12 text-base"
                onClick={handleComplete}
              >
                <Check className="mr-2 w-4 h-4" />
                Get Started
              </Button>

              <button 
                className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setStep('state')}
              >
                ← Go back
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
