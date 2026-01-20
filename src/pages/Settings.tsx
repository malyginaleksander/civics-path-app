import { Moon, Sun, Type, Volume2, Bell, Trash2, Info, Crown, Loader2, Gift, Users, MapPin, Pencil, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { statesData, federalOfficials, getStateData } from '@/data/stateData';

const Settings = () => {
  const { settings, updateSettings, clearAllData, testResults, learningList, seenQuestions, trialDaysLeft, isPremium, activatePromoCode, clearPromoCode, usedPromoCode } = useApp();
  const { offerings, getOfferings, purchasePackage, restorePurchases, isLoading } = useRevenueCat();
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isEditingOfficials, setIsEditingOfficials] = useState(false);
  const [customGovernor, setCustomGovernor] = useState(settings.customOfficials?.governor || '');
  const [customSenator1, setCustomSenator1] = useState(settings.customOfficials?.senator1 || '');
  const [customSenator2, setCustomSenator2] = useState(settings.customOfficials?.senator2 || '');

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
    if (!currentPackage) {
      console.error('No package available - RevenueCat not configured');
      alert('Purchase not available. Please contact support.');
      return;
    }
    await purchasePackage(currentPackage);
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  const handlePromoCode = () => {
    const result = activatePromoCode(promoCode);
    if (result.success) {
      toast.success(result.message);
      setPromoCode('');
    } else {
      toast.error(result.message);
    }
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
                      ? (usedPromoCode 
                          ? `Activated with code "${usedPromoCode}"`
                          : 'You have full access to all features')
                      : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining`
                    }
                  </p>
                  {isPremium && usedPromoCode && (
                    <button
                      onClick={() => {
                        clearPromoCode();
                        toast.message('Promo code cleared. You can enter a new one.');
                      }}
                      className="mt-1 text-xs text-primary hover:underline"
                      type="button"
                    >
                      Use different code
                    </button>
                  )}
                </div>
              </div>
              {!isPremium && isNative && (
                <Button 
                  size="sm" 
                  onClick={handleUpgrade}
                  disabled={isLoading}
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
            
            {/* Promo Code Section */}
            {!isPremium && (
              <div className="px-4 pb-4 pt-2 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Have a promo code?</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={handlePromoCode}
                    disabled={!promoCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
                {usedPromoCode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    A code is already applied. Tap “Use different code” above to change it.
                  </p>
                )}
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

        {/* Test Options */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Test Options</h2>
          
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            {/* State Selection */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Your State</p>
                  <p className="text-sm text-muted-foreground">
                    For state-specific questions (governor, senators, capital)
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <Select
                  value={settings.selectedState || ''}
                  onValueChange={(value) => updateSettings({ selectedState: value || null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statesData.map((state) => (
                      <SelectItem key={state.abbreviation} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {settings.selectedState && !isEditingOfficials && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                    {(() => {
                      const state = getStateData(settings.selectedState);
                      if (!state) return null;
                      const hasCustom = settings.customOfficials?.governor || 
                                        settings.customOfficials?.senator1 || 
                                        settings.customOfficials?.senator2;
                      return (
                        <>
                          <p><strong>Capital:</strong> {state.capital}</p>
                          <p>
                            <strong>Governor:</strong> {settings.customOfficials?.governor || state.governor}
                            {settings.customOfficials?.governor && <span className="text-primary ml-1">(custom)</span>}
                          </p>
                          <p>
                            <strong>Senators:</strong>{' '}
                            {settings.customOfficials?.senator1 || state.senators[0]}
                            {settings.customOfficials?.senator1 && <span className="text-primary ml-1">(custom)</span>}
                            {', '}
                            {settings.customOfficials?.senator2 || state.senators[1]}
                            {settings.customOfficials?.senator2 && <span className="text-primary ml-1">(custom)</span>}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const state = getStateData(settings.selectedState!);
                                setCustomGovernor(settings.customOfficials?.governor || '');
                                setCustomSenator1(settings.customOfficials?.senator1 || '');
                                setCustomSenator2(settings.customOfficials?.senator2 || '');
                                setIsEditingOfficials(true);
                              }}
                            >
                              <Pencil size={14} className="mr-1" />
                              Edit Officials
                            </Button>
                            {hasCustom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  updateSettings({ customOfficials: null });
                                  setCustomGovernor('');
                                  setCustomSenator1('');
                                  setCustomSenator2('');
                                }}
                              >
                                <RotateCcw size={14} className="mr-1" />
                                Reset
                              </Button>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                
                {/* Edit Officials Form */}
                {settings.selectedState && isEditingOfficials && (
                  <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-foreground">Customize Officials</p>
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use default values. Changes apply to practice tests and study mode.
                    </p>
                    <div>
                      <label className="text-xs text-muted-foreground">Governor</label>
                      <Input
                        value={customGovernor}
                        onChange={(e) => setCustomGovernor(e.target.value)}
                        placeholder={getStateData(settings.selectedState)?.governor}
                        className="mt-1"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Senator 1</label>
                      <Input
                        value={customSenator1}
                        onChange={(e) => setCustomSenator1(e.target.value)}
                        placeholder={getStateData(settings.selectedState)?.senators[0]}
                        className="mt-1"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Senator 2</label>
                      <Input
                        value={customSenator2}
                        onChange={(e) => setCustomSenator2(e.target.value)}
                        placeholder={getStateData(settings.selectedState)?.senators[1]}
                        className="mt-1"
                        maxLength={100}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const trimmedGovernor = customGovernor.trim();
                          const trimmedSenator1 = customSenator1.trim();
                          const trimmedSenator2 = customSenator2.trim();
                          
                          if (!trimmedGovernor && !trimmedSenator1 && !trimmedSenator2) {
                            updateSettings({ customOfficials: null });
                          } else {
                            updateSettings({
                              customOfficials: {
                                governor: trimmedGovernor || undefined,
                                senator1: trimmedSenator1 || undefined,
                                senator2: trimmedSenator2 || undefined,
                              }
                            });
                          }
                          setIsEditingOfficials(false);
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCustomGovernor(settings.customOfficials?.governor || '');
                          setCustomSenator1(settings.customOfficials?.senator1 || '');
                          setCustomSenator2(settings.customOfficials?.senator2 || '');
                          setIsEditingOfficials(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Federal Officials Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <Info size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Current Federal Officials</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {federalOfficials.lastUpdated}
                  </p>
                </div>
              </div>
              <div className="ml-8 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <p><strong>President:</strong> {federalOfficials.president}</p>
                <p><strong>Vice President:</strong> {federalOfficials.vicePresident}</p>
                <p><strong>Speaker of House:</strong> {federalOfficials.speakerOfHouse}</p>
                <p><strong>Chief Justice:</strong> {federalOfficials.chiefJustice}</p>
                <a 
                  href="https://www.uscis.gov/citizenship/testupdates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline block mt-2"
                >
                  Verify at uscis.gov →
                </a>
              </div>
            </div>

            {/* Senior Mode */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Senior Mode (65/20 Rule)</p>
                  <p className="text-sm text-muted-foreground">
                    For applicants 65+ with 20+ years as permanent resident. Only 20 specially marked questions.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.seniorMode}
                onCheckedChange={(checked) => updateSettings({ seniorMode: checked })}
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
            <img 
              src="https://flagcdn.com/w80/us.png" 
              alt="USA Flag" 
              className="w-10 h-auto mx-auto mb-3"
            />
            <p className="font-bold text-foreground">US Citizenship Test Prep</p>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground mt-2">
              128 official 2025 USCIS civics questions
            </p>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="mb-2">
                <strong>Disclaimer:</strong> This app is not affiliated with, endorsed by, 
                or sponsored by the U.S. government, USCIS, or any government agency.
              </p>
              <p>
                Study materials are based on the official USCIS civics test.{' '}
                <a 
                  href="https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  View official source →
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Settings;
