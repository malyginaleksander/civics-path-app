import { Home, FileText, BookOpen, Bookmark, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Capacitor } from '@capacitor/core';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/results', icon: FileText, label: 'Results' },
  { to: '/study', icon: BookOpen, label: 'Study' },
  { to: '/learning', icon: Bookmark, label: 'Learning' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const BottomNav = () => {
  const isIOS = Capacitor.getPlatform() === 'ios';
  
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border",
      isIOS ? "safe-area-bottom" : "pb-[env(safe-area-inset-bottom,0px)]"
    )}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
