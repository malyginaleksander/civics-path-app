import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Blue safe area bar for mobile devices */}
      <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top,0px)] bg-primary z-50" />
      <div className="pt-[env(safe-area-inset-top,0px)]">
        <main className="pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
