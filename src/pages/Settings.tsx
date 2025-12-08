import { Moon, Sun, Type, Volume2, Bell, Trash2, Info, Crown, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

const Settings = () => {
  const { settings, updateSettings, clearAllData, testResults, learningList, seenQuestions, trialDaysLeft, isPremium } = useApp();
  const { offerings, getOfferings, purchasePackage, restorePurchases, isLoading } = useRevenueCat();
  const [currentPackage, setCurrentPackage] = useState<any>(null);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative && !isPremium) {
      getOfferings();
    }
  }, [isNative, isPremium]);

  useEffect(() => {
    if (offerings?.current?.availablePackages?.length > 0) {
      setCurrentPackage(offerings.current.availablePackages[0]);
    }
  }, [offerings]);

  const handleUpgrade = async () => {
    if (currentPackage) {
      await purchasePackage(currentPackage);
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  const fontSizes = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ] as const;

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This will reset your progress, test results, and learning list.')) {
      clearAllData();
    }
  };

  return (
    <Layout>
      <PageHeader title="Settings" />

      <div className="px-4 py-4 max-w-3xl mx-auto">
        {/* Subscription */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Subscription</h2>
          
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown size={20} className={isPremium ? "text-primary" : "text-muted-foreground"} />
                <div>
                  <p className="font-medium text-foreground">
                    {isPremium ? 'Premium Active' : 'Free Trial'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium 
                      ? 'You have full access to all features'
                      : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining`
                    }
                  </p>
                </div>
              </div>
              {!isPremium && isNative && (
                <Button 
                  size="sm" 
                  onClick={handleUpgrade}
                  disabled={isLoading || !currentPackage}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade'}
                </Button>
              )}
            </div>
            {!isPremium && isNative && (
              <div className="px-4 pb-4 pt-0">
                <button
                  onClick={handleRestore}
                  disabled={isLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Restore Purchase
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Appearance</h2>
          
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            {/* Theme Toggle */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                {settings.theme === 'dark' ? (
                  <Moon size={20} className="text-muted-foreground" />
                ) : (
                  <Sun size={20} className="text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred appearance</p>
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                {(['auto', 'light', 'dark'] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant={settings.theme === theme ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ theme })}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Type size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Font Size</p>
                  <p className="text-sm text-muted-foreground">Adjust text size for readability</p>
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                {fontSizes.map((size) => (
                  <Button
                    key={size.value}
                    variant={settings.fontSize === size.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ fontSize: size.value })}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Audio */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Audio</h2>
          
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Text-to-Speech</p>
                  <p className="text-sm text-muted-foreground">Listen to questions and answers</p>
                </div>
              </div>
              <Switch
                checked={settings.audioEnabled}
                onCheckedChange={(checked) => updateSettings({ audioEnabled: checked })}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Auto-play Audio</p>
                  <p className="text-sm text-muted-foreground">Automatically read questions aloud</p>
                </div>
              </div>
              <Switch
                checked={settings.audioAutoplay}
                onCheckedChange={(checked) => updateSettings({ audioAutoplay: checked })}
                disabled={!settings.audioEnabled}
              />
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Data & Storage</h2>
          
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            {/* Stats */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <Info size={20} className="text-muted-foreground" />
                <p className="font-medium text-foreground">Your Progress</p>
              </div>
              <div className="grid grid-cols-3 gap-4 ml-8">
                <div>
                  <p className="text-2xl font-bold text-primary">{testResults.length}</p>
                  <p className="text-xs text-muted-foreground">Tests Taken</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{seenQuestions.length}</p>
                  <p className="text-xs text-muted-foreground">Questions Seen</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{learningList.length}</p>
                  <p className="text-xs text-muted-foreground">In Learning List</p>
                </div>
              </div>
            </div>

            {/* Clear Data */}
            <div className="p-4">
              <button
                onClick={handleClearData}
                className="w-full flex items-center justify-between text-left hover:bg-destructive/5 -m-4 p-4 transition-colors rounded-b-xl"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={20} className="text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Clear All Data</p>
                    <p className="text-sm text-muted-foreground">Reset progress and settings</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🇺🇸</span>
            <p className="font-bold text-foreground">US Citizenship Test Prep</p>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground mt-2">
              100 official USCIS civics questions
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Settings;
