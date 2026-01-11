'use client';

import { useEffect, useRef } from 'react';

interface AnimatedLinesProps {
  density?: number;
  color?: string;
  opacity?: number;
}

export const AnimatedLines = ({ 
  density = 50, 
  color = '#6366f1',
  opacity = 0.3 
}: AnimatedLinesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Parse color
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 99, g: 102, b: 241 };
    };

    const rgb = hexToRgb(color);

    // Create dots
    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }

    const dots: Dot[] = [];
    for (let i = 0; i < density; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw dots
      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        ctx.fill();
      });

      // Draw lines between close dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            const lineOpacity = (1 - distance / 150) * opacity;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${lineOpacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [density, color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
