'use client';

import { ReactNode } from 'react';

interface AnimatedGradientProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGradient({ children, className = '' }: AnimatedGradientProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-purple-400/20 animate-gradient-shift" />
      {children}
    </div>
  );
}
