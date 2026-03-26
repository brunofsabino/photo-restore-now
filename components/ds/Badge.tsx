/**
 * Badge Component - Refactoring UI Style
 * Clear semantic colors
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn, badgeVariants } from '@/lib/design-system';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'neutral';
  icon?: React.ReactNode;
}

export const DSBadge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'neutral',
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants[variant], className)}
        {...props}
      >
        {icon}
        {children}
      </span>
    );
  }
);

DSBadge.displayName = 'DSBadge';
