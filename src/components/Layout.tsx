import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 safe-area-top">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
