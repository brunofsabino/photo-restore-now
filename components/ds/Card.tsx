/**
 * Card Component - Refactoring UI Style
 * Less borders, more shadows
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn, cardVariants } from '@/lib/design-system';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'featured' | 'flat' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  asChild?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

export const DSCard = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
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
          cardVariants[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DSCard.displayName = 'DSCard';

// Card sub-components for structured content
export const DSCardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-6', className)}
    {...props}
  />
));

DSCardHeader.displayName = 'DSCardHeader';

export const DSCardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-bold text-gray-900 mb-2', className)}
    {...props}
  />
));

DSCardTitle.displayName = 'DSCardTitle';

export const DSCardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-base text-gray-600 leading-relaxed', className)}
    {...props}
  />
));

DSCardDescription.displayName = 'DSCardDescription';

export const DSCardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));

DSCardContent.displayName = 'DSCardContent';

export const DSCardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-6 pt-6 border-t border-gray-100', className)}
    {...props}
  />
));

DSCardFooter.displayName = 'DSCardFooter';
