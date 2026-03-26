/**
 * Container Component - Responsive width constraints
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn, containers } from '@/lib/design-system';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

export const DSContainer = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = 'lg',
      center = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          containers[size],
          center && 'mx-auto',
          'px-4 sm:px-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DSContainer.displayName = 'DSContainer';
