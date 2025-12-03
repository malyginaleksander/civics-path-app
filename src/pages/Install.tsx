import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle2, Share, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <Layout>
        <PageHeader title="Install App" showBack />
        <div className="p-4">
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">App Installed!</h2>
            <p className="text-muted-foreground">
              You can now use the app from your home screen and practice offline.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader title="Install App" showBack />
      <div className="p-4 space-y-6">
        <Card className="p-6 text-center">
          <Smartphone className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Install on Your Device
          </h2>
          <p className="text-muted-foreground mb-6">
            Add this app to your home screen for quick access and offline practice.
          </p>

          {deferredPrompt && (
            <Button onClick={handleInstall} size="lg" className="w-full">
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          )}
        </Card>

        {isIOS && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              How to install on iPhone/iPad:
            </h3>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <span className="flex items-center gap-2">
                  Tap the <Share className="w-5 h-5 text-primary" /> Share button in Safari
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </span>
                <span>Scroll down and tap "Add to Home Screen"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <span>Tap "Add" to confirm</span>
              </li>
            </ol>
          </Card>
        )}

        {!isIOS && !deferredPrompt && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              How to install on Android:
            </h3>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <span className="flex items-center gap-2">
                  Tap the <MoreVertical className="w-5 h-5 text-primary" /> menu in Chrome
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </span>
                <span>Tap "Install app" or "Add to Home screen"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <span>Tap "Install" to confirm</span>
              </li>
            </ol>
          </Card>
        )}

        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">Benefits of installing:</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Practice offline without internet
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Quick access from home screen
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Full-screen experience
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Faster loading times
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
