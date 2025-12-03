import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background safe-area-top">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
