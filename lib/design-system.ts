/**
 * Design System based on Refactoring UI principles
 * 
 * Key principles:
 * - Use fewer borders, more shadows
 * - Text hierarchy through size AND weight
 * - Consistent spacing scale
 * - Semantic color system
 * - Clear visual hierarchy
 */

// ============================================
// SPACING SCALE (rem based, consistent 8px grid)
// ============================================
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ============================================
// TYPOGRAPHY SYSTEM
// ============================================
export const typography = {
  // Display text
  display: {
    xl: 'text-6xl font-extrabold leading-none tracking-tight',
    lg: 'text-5xl font-extrabold leading-tight tracking-tight',
    md: 'text-4xl font-bold leading-tight tracking-tight',
    sm: 'text-3xl font-bold leading-snug',
  },
  
  // Heading text
  heading: {
    xl: 'text-3xl font-bold leading-snug',
    lg: 'text-2xl font-bold leading-snug',
    md: 'text-xl font-bold leading-normal',
    sm: 'text-lg font-bold leading-normal',
    xs: 'text-base font-bold leading-normal',
  },
  
  // Body text
  body: {
    xl: 'text-xl font-normal leading-relaxed',
    lg: 'text-lg font-normal leading-relaxed',
    md: 'text-base font-normal leading-relaxed',
    sm: 'text-sm font-normal leading-normal',
    xs: 'text-xs font-normal leading-normal',
  },
  
  // Label/UI text (shorter line-height for UI elements)
  label: {
    lg: 'text-base font-semibold leading-tight',
    md: 'text-sm font-semibold leading-tight',
    sm: 'text-xs font-semibold leading-tight',
  },
  
  // Supporting text (lighter weight, smaller)
  supporting: {
    md: 'text-sm font-medium text-gray-600',
    sm: 'text-xs font-medium text-gray-500',
  },
} as const;

// ============================================
// COLOR SYSTEM (Semantic + Accessible)
// ============================================
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Success states
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  
  // Warning states
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  // Error states
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Neutral grays (higher contrast for better readability)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

// ============================================
// SHADOW SYSTEM (Replace borders with subtle shadows)
// ============================================
export const shadows = {
  none: 'shadow-none',
  xs: 'shadow-sm',                    // Subtle elevation
  sm: 'shadow-md',                    // Card elevation
  md: 'shadow-lg',                    // Active card, dropdowns
  lg: 'shadow-xl',                    // Modals, popovers
  xl: 'shadow-2xl',                   // Maximum elevation
  
  // Colored shadows for CTAs
  primary: 'shadow-lg shadow-primary-200/50',
  success: 'shadow-lg shadow-success-200/50',
} as const;

// ============================================
// BORDER RADIUS SYSTEM
// ============================================
export const radius = {
  none: 'rounded-none',
  sm: 'rounded-md',      // 6px - small elements
  md: 'rounded-lg',      // 8px - cards, buttons
  lg: 'rounded-xl',      // 12px - large cards
  xl: 'rounded-2xl',     // 16px - hero sections
  full: 'rounded-full',  // Pills, avatars
} as const;

// ============================================
// BUTTON VARIANTS (Clear hierarchy)
// ============================================
export const buttonVariants = {
  // Primary CTA - maximum attention
  primary: `
    bg-primary-600 text-white font-semibold
    hover:bg-primary-700 active:bg-primary-800
    ${shadows.primary}
    hover:shadow-xl hover:-translate-y-0.5
    transition-all duration-200
    ${radius.md}
  `,
  
  // Secondary - still important but less attention
  secondary: `
    bg-white text-gray-900 font-semibold border-2 border-gray-200
    hover:border-gray-300 hover:bg-gray-50
    active:bg-gray-100
    ${shadows.sm}
    hover:shadow-md
    transition-all duration-200
    ${radius.md}
  `,
  
  // Ghost - minimal style for tertiary actions
  ghost: `
    bg-transparent text-gray-700 font-medium
    hover:bg-gray-100 active:bg-gray-200
    transition-colors duration-200
    ${radius.md}
  `,
  
  // Destructive - for dangerous actions
  destructive: `
    bg-error-600 text-white font-semibold
    hover:bg-error-700 active:bg-error-800
    ${shadows.sm}
    hover:shadow-md
    transition-all duration-200
    ${radius.md}
  `,
} as const;

// ============================================
// CARD VARIANTS (Less borders, more shadows)
// ============================================
export const cardVariants = {
  // Default card - subtle shadow, no border
  default: `
    bg-white ${shadows.sm} ${radius.lg}
    hover:shadow-md transition-shadow duration-200
  `,
  
  // Interactive card - shows it's clickable
  interactive: `
    bg-white ${shadows.sm} ${radius.lg}
    hover:shadow-lg hover:-translate-y-1
    active:scale-98
    transition-all duration-200
    cursor-pointer
  `,
  
  // Featured card - stands out more
  featured: `
    bg-gradient-to-br from-primary-50 to-white
    ${shadows.md} ${radius.lg}
    border-2 border-primary-200
    hover:shadow-xl hover:-translate-y-1
    transition-all duration-200
  `,
  
  // Flat card - no shadow, just background
  flat: `
    bg-gray-50 ${radius.lg}
    hover:bg-gray-100
    transition-colors duration-200
  `,
  
  // Glass morphism - modern blurred background
  glass: `
    bg-white/60 backdrop-blur-md ${shadows.sm} ${radius.lg}
    border border-white/20
    hover:bg-white/70 hover:shadow-md
    transition-all duration-200
  `,
} as const;

// ============================================
// BADGE/TAG VARIANTS
// ============================================
export const badgeVariants = {
  primary: `
    inline-flex items-center gap-1.5 px-3 py-1
    bg-primary-100 text-primary-700 font-semibold text-sm
    ${radius.full}
  `,
  
  success: `
    inline-flex items-center gap-1.5 px-3 py-1
    bg-success-100 text-success-700 font-semibold text-sm
    ${radius.full}
  `,
  
  warning: `
    inline-flex items-center gap-1.5 px-3 py-1
    bg-warning-100 text-warning-700 font-semibold text-sm
    ${radius.full}
  `,
  
  neutral: `
    inline-flex items-center gap-1.5 px-3 py-1
    bg-gray-100 text-gray-700 font-semibold text-sm
    ${radius.full}
  `,
} as const;

// ============================================
// INPUT VARIANTS
// ============================================
export const inputVariants = {
  default: `
    w-full px-4 py-3 ${radius.md}
    bg-white border-2 border-gray-200
    text-gray-900 placeholder:text-gray-400
    font-medium
    focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100
    transition-all duration-200
  `,
  
  error: `
    w-full px-4 py-3 ${radius.md}
    bg-white border-2 border-error-500
    text-gray-900 placeholder:text-gray-400
    font-medium
    focus:outline-none focus:border-error-600 focus:ring-4 focus:ring-error-100
    transition-all duration-200
  `,
} as const;

// ============================================
// ANIMATION UTILITIES
// ============================================
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideDown: 'animate-in slide-in-from-top-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  
  // Hover lift effect
  hoverLift: 'hover:-translate-y-1 transition-transform duration-200',
  
  // Hover scale
  hoverScale: 'hover:scale-105 transition-transform duration-200',
} as const;

// ============================================
// CONTAINER SIZES
// ============================================
export const containers = {
  xs: 'max-w-md',    // 448px - small forms
  sm: 'max-w-2xl',   // 672px - content
  md: 'max-w-4xl',   // 896px - articles
  lg: 'max-w-6xl',   // 1152px - dashboards
  xl: 'max-w-7xl',   // 1280px - full app
} as const;

// ============================================
// HELPER: Combine classes utility
// ============================================
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
