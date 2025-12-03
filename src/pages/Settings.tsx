import { Moon, Sun, Type, Volume2, Bell, Trash2, Info } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { settings, updateSettings, clearAllData, testResults, learningList, seenQuestions } = useApp();

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
        {/* Appearance */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Appearance</h2>
          
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            {/* Theme Toggle */}
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                {settings.theme === 'dark' ? (
                  <Moon size={20} className="text-muted-foreground" />
                ) : (
                  <Sun size={20} className="text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Easier on the eyes at night</p>
                </div>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
              />
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
