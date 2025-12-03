import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  variant?: 'primary' | 'secondary';
  badge?: string;
}

export const HomeCard = ({
  to,
  icon,
  title,
  description,
  variant = 'secondary',
  badge,
}: HomeCardProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'block p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] card-shadow-lg',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-card-foreground'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'p-3 rounded-xl',
            variant === 'primary'
              ? 'bg-primary-foreground/20'
              : 'bg-primary/10'
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-warning text-warning-foreground">
                {badge}
              </span>
            )}
          </div>
          <p
            className={cn(
              'text-sm',
              variant === 'primary'
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};
