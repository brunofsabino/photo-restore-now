/**
 * Typography Components - Semantic HTML with consistent styling
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn, typography } from '@/lib/design-system';

// Display Text
interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 'xl' | 'lg' | 'md' | 'sm';
  as?: 'h1' | 'h2' | 'h3';
}

export const DSDisplay = forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ size = 'lg', as: Component = 'h1', className, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(typography.display[size], 'text-gray-900', className)}
      {...props}
    />
  )
);

DSDisplay.displayName = 'DSDisplay';

// Heading
interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const DSHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ size = 'md', as: Component = 'h2', className, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(typography.heading[size], 'text-gray-900', className)}
      {...props}
    />
  )
);

DSHeading.displayName = 'DSHeading';

// Body Text
interface BodyTextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
}

export const DSText = forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(typography.body[size], 'text-gray-700', className)}
      {...props}
    />
  )
);

DSText.displayName = 'DSText';

// Label Text
interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  size?: 'lg' | 'md' | 'sm';
  htmlFor?: string;
}

export const DSLabel = forwardRef<HTMLLabelElement, LabelProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(typography.label[size], 'text-gray-900', className)}
      {...props}
    />
  )
);

DSLabel.displayName = 'DSLabel';

// Supporting Text
interface SupportingTextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'md' | 'sm';
}

export const DSSupportingText = forwardRef<HTMLParagraphElement, SupportingTextProps>(
  ({ size = 'sm', className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(typography.supporting[size], className)}
      {...props}
    />
  )
);

DSSupportingText.displayName = 'DSSupportingText';
