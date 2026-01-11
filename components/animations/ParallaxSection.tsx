'use client';

import { useEffect, useRef, useState } from 'react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxSection = ({ children, speed = 0.5, className = '' }: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;
      
      // Calculate parallax offset
      if (rect.top < windowHeight && rect.bottom > 0) {
        const parallax = (scrolled - elementTop + windowHeight) * speed;
        setOffset(parallax);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        style={{
          transform: `translateY(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
