import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useApp } from '@/contexts/AppContext';
import { Capacitor } from '@capacitor/core';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { settings } = useApp();

  const platform = Capacitor.getPlatform();
  const isNative = platform === 'android' || platform === 'ios';
  const isAndroid = platform === 'android';
  const showLightStatusBarBg = !isNative && settings.theme !== 'dark';

  // Android WebViews often don't support env(safe-area-inset-top), so use a
  // fixed fallback (24px) to avoid content hiding behind the status bar.
  const topPadding = isAndroid
    ? 'pt-6'
    : 'pt-[env(safe-area-inset-top,0px)]';

  return (
    <>
      {showLightStatusBarBg && (
        <div
          className="fixed left-0 right-0 top-0 z-0 pointer-events-none"
          style={{ height: 'env(safe-area-inset-top,24px)', background: '#ffffff' }}
        />
      )}

      <div className={`min-h-screen bg-background ${topPadding}`}>
        <main className="pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  );
};
