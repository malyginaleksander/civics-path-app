import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Capacitor } from '@capacitor/core';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  rightContent?: ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  showBack = false,
  backTo = '/',
  rightContent,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const isAndroid = Capacitor.getPlatform() === 'android';

  const handleBack = () => {
    // Always navigate to backTo route - more reliable in Capacitor WebViews
    navigate(backTo);
  };

  return (
    <header className={`sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border ${isAndroid ? 'pt-6' : 'pt-[env(safe-area-inset-top,0px)]'}`}>
      <div className="flex items-center justify-between h-14 px-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="-ml-2"
            >
              <ChevronLeft size={24} />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
};
