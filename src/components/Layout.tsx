import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useApp } from '@/contexts/AppContext';
import { Capacitor } from '@capacitor/core';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { settings } = useApp();

  // Show a short, fixed background behind the status bar area when using
  // the light theme. This is a UI-only fallback for devices / WebViews that
  // don't honor native status bar icon color changes.
  // Only show the UI fallback on non-native platforms. On Android/iOS
  // prefer the native StatusBar plugin to control the icons/background.
  const isNative = Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';
  const showLightStatusBarBg = !isNative && settings.theme !== 'dark';

  return (
    <>
      {showLightStatusBarBg && (
        <div
          className="fixed left-0 right-0 top-0 z-0 pointer-events-none"
          style={{ height: 'env(safe-area-inset-top,24px)', background: '#ffffff' }}
        />
      )}

      <div className="min-h-screen bg-background pt-[env(safe-area-inset-top,0px)]">
        <main className="pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </>
    <div className="min-h-screen bg-background" style={{ paddingTop: 'max(env(safe-area-inset-top, 24px), 24px)' }}>
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
